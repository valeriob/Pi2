
interface SignalR {

    gpioHub: gpioHubProxy;
}
interface gpioHubProxy {
    client: gpioHubClient;
    server: gpioHubServer;
}

interface gpioHubClient {
    notifyPinEdge(device: string, pinNumber: number, edge: number);
   
    //raggruppamentoOrdiniModificato: (raggruppamentoOrdiniId: string, ordiniRimossi: string[], ordiniAggiunti: string[]) => void;
    //ordiniModificati: (ordineId: string[], correlationId: string) => void;
}

interface gpioHubServer {
    //joinAccount(accountId: number): JQueryPromise<void>;
    configureOutputPin(device: string, pinNumber: number);
    configureInputPin(device: string, pinNumber: number);
    resetDevice(device: string);
    writeOutputPinValue(device: string, pinNumber: number, value: number)
}


module Pi2.Remote.Web.Pi {

    export class ViewModel {

        gpioHub: gpioHubProxy;
        device: string;
        events: KnockoutObservableArray<GpioEvent>;
        eventsPulsanteA: KnockoutObservableArray<GpioEvent>;
        eventsPulsanteB: KnockoutObservableArray<GpioEvent>;
        pulsanteA: number;
        pulsanteB: number;
        ledRosso: number;
        ledGiallo: number;

        constructor() {
            this.device = "Pi";
           
            this.pulsanteA = 6;
            this.pulsanteB = 13;
            this.ledRosso = 18;
            this.ledGiallo = 16;

            this.events = ko.observableArray<GpioEvent>();
            this.eventsPulsanteA = ko.observableArray<GpioEvent>();
            this.eventsPulsanteB = ko.observableArray<GpioEvent>();

            $(() => {

                this.gpioHub = $.signalR.gpioHub;

                $.connection.hub.received(function (data) {
                    console.log(data);
                });
                $.connection.hub.error(function (error) {
                    console.warn(error);
                });

                this.gpioHub.client.notifyPinEdge = (device, pinNumber, edge) => {
                    var msg = device + " : " + pinNumber + " ";
                    if (edge === 1)
                        msg = msg + "salita";
                    else
                        msg = msg + "discesa";

                    console.log(msg);
                    this.events.push(new GpioEvent(msg));

                    if (pinNumber === this.pulsanteA) {
                        this.gpioHub.server.writeOutputPinValue(device, this.ledRosso, (edge + 1) % 2);
                        this.eventsPulsanteA.push(new GpioEvent(msg));
                    }
                    if (pinNumber === this.pulsanteB) {
                        this.gpioHub.server.writeOutputPinValue(device, this.ledGiallo, edge);
                        this.eventsPulsanteB.push(new GpioEvent(msg));
                    }
                }

                $.connection.hub.start().done(() => {

                });

            });

        }

        public turnLedRossoOn() {
            this.gpioHub.server.writeOutputPinValue(this.device, this.ledRosso, 1);
        }

        public turnLedRossoOff() {
            this.gpioHub.server.writeOutputPinValue(this.device, this.ledRosso, 0);
        }

        public turnLedGialloOn() {
            this.gpioHub.server.writeOutputPinValue(this.device, this.ledGiallo, 1);
        }

        public turnLedGialloOff() {
            this.gpioHub.server.writeOutputPinValue(this.device, this.ledGiallo, 0);
        }

        public configure() {
            this.gpioHub.server.configureOutputPin(this.device, this.ledRosso);
            this.gpioHub.server.configureOutputPin(this.device, this.ledGiallo);
            this.gpioHub.server.configureInputPin(this.device, this.pulsanteA);
            this.gpioHub.server.configureInputPin(this.device, this.pulsanteB);
        }

        public reset() {
            this.gpioHub.server.resetDevice(this.device);
            this.events.removeAll();
        }
    }

    export class GpioEvent {
        timestamp: Date;
        time: string;
        description: string;

        constructor(desc: string) {
            var date = new Date();
            this.timestamp = date;
            this.time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            this.description = desc;
        }
    }
}