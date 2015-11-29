
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

    writeOutputPinValue(device: string, pinNumber: number, value: number)
}


module Pi2.Remote.Web.Pi {

    export class ViewModel {

        gpioHub: gpioHubProxy;
        device: string;
        events: KnockoutObservableArray<GpioEvent>;
        constructor() {
            this.device = "Pi";
            this.events = ko.observableArray<GpioEvent>();


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

                    this.gpioHub.server.writeOutputPinValue(device, 18, edge);
                }

                $.connection.hub.start().done(() => {

                });

            });

        }

        public turnLedOn() {
            this.gpioHub.server.writeOutputPinValue(this.device, 18, 1);
        }

        public turnLedOff() {
            this.gpioHub.server.writeOutputPinValue(this.device, 18, 0);
        }

        public configure() {
            this.gpioHub.server.configureOutputPin(this.device, 18);
            this.gpioHub.server.configureInputPin(this.device, 6);
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