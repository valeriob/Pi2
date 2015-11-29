
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
        eventsButtonA: KnockoutObservableArray<GpioEvent>;
        eventsButtonB: KnockoutObservableArray<GpioEvent>;

        buttonASpeed: KnockoutObservable<number>;
        buttonBSpeed: KnockoutObservable<number>;

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

            this.eventsButtonA = ko.observableArray<GpioEvent>();
            this.eventsButtonB = ko.observableArray<GpioEvent>();
            this.buttonASpeed = ko.observable<number>();
            this.buttonBSpeed = ko.observable<number>();

            var buttonAClicked = new Rx.Subject<number>();
            var buttonBClicked = new Rx.Subject<number>();

            buttonAClicked.bufferWithCount(2).select(s=> 1)
                .bufferWithTime(500)
                .subscribe(s=> {
                    this.buttonASpeed(s.length / 0.5);
                });

            buttonBClicked.bufferWithCount(2).select(s=> 1)
                .bufferWithTime(500)
                .subscribe(s=> {
                    this.buttonBSpeed(s.length / 0.5);
                });

            $(() => {

                this.gpioHub = $.signalR.gpioHub;

                $.connection.hub.received(function (data) {
                    console.log(data);
                });
                $.connection.hub.error(function (error) {
                    console.warn(error);
                });

                this.gpioHub.client.notifyPinEdge = (device, pinNumber, edge) => {

                    var msg = this.formatMessage(device, pinNumber, edge);
                    console.log(msg);

                    if (pinNumber === this.buttonA) {
                        this.gpioHub.server.writeOutputPinValue(device, this.redLed, (edge + 1) % 2);
                        this.eventsButtonA.push(new GpioEvent(msg));
                        buttonAClicked.onNext(edge);
                    }
                    if (pinNumber === this.buttonB) {
                        this.gpioHub.server.writeOutputPinValue(device, this.yellowLed, edge);
                        this.eventsButtonB.push(new GpioEvent(msg));
                        buttonBClicked.onNext(edge);
                    }
                }

                $.connection.hub.start().done(() => {

                });

            });

        }

        formatMessage(device: string, pinNumber : number, edge : number) : string {
            var button = "Button A";

            if (pinNumber === this.buttonB)
                button = "Button B";

            var msg = device + " : " + button + " ";
            if (edge === 1)
                msg = msg + "pressed";
            else
                msg = msg + "released";
            return msg;
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