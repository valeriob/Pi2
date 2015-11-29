
interface SignalR {

    gpioHub: gpioHubProxy;
}
interface gpioHubProxy {
    client: gpioHubClient;
    server: gpioHubServer;
}

interface gpioHubClient {
    notifyPinEdge(device: string, pinNumber: number, edge: number);
}

interface gpioHubServer {

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
        eventsButtonA: KnockoutObservableArray<GpioEvent>;
        eventsButtonB: KnockoutObservableArray<GpioEvent>;
        buttonA: number;
        buttonB: number;
        redLed: number;
        yellowLed: number;

        constructor() {
            this.device = "Pi";
           
            this.buttonA = 6;
            this.buttonB = 13;
            this.redLed = 18;
            this.yellowLed = 16;

            this.events = ko.observableArray<GpioEvent>();
            this.eventsButtonA = ko.observableArray<GpioEvent>();
            this.eventsButtonB = ko.observableArray<GpioEvent>();

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
                        msg = msg + "pressed";
                    else
                        msg = msg + "released";

                    console.log(msg);
                    this.events.push(new GpioEvent(msg));

                    if (pinNumber === this.buttonA) {
                        this.gpioHub.server.writeOutputPinValue(device, this.redLed, (edge + 1) % 2);
                        this.eventsButtonA.push(new GpioEvent(msg));
                    }
                    if (pinNumber === this.buttonB) {
                        this.gpioHub.server.writeOutputPinValue(device, this.yellowLed, edge);
                        this.eventsButtonB.push(new GpioEvent(msg));
                    }
                }

                $.connection.hub.start().done(() => {

                });

            });

        }

        public turnLedRedOn() {
            this.gpioHub.server.writeOutputPinValue(this.device, this.redLed, 1);
        }

        public turnLedRedOff() {
            this.gpioHub.server.writeOutputPinValue(this.device, this.redLed, 0);
        }

        public turnLedYellowOn() {
            this.gpioHub.server.writeOutputPinValue(this.device, this.yellowLed, 1);
        }

        public turnLedYellowOff() {
            this.gpioHub.server.writeOutputPinValue(this.device, this.yellowLed, 0);
        }

        public configure() {
            this.gpioHub.server.configureOutputPin(this.device, this.redLed);
            this.gpioHub.server.configureOutputPin(this.device, this.yellowLed);
            this.gpioHub.server.configureInputPin(this.device, this.buttonA);
            this.gpioHub.server.configureInputPin(this.device, this.buttonB);
        }

        public reset() {
            this.gpioHub.server.resetDevice(this.device);
            this.events.removeAll();
            this.eventsButtonA.removeAll();
            this.eventsButtonB.removeAll();
        }
    }

    export class GpioEvent {
        timestamp: Date;
        time: string;
        description: string;

        constructor(desc: string) {
            var date = new Date();
            this.timestamp = date;
            this.time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "," + date.getMilliseconds();
            this.description = desc;
        }
    }
}