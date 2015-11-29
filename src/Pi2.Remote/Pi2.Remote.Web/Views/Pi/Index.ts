
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

    writeOutputPinValue(device : string, pinNumber : number, value : number)
}


module Pi2.Remote.Web.Pi {

    export class ViewModel {

        gpioHub: gpioHubProxy;
        device: string;

        constructor() {
            this.device = "Pi";
            $(() => {

                this.gpioHub = $.signalR.gpioHub;

                $.connection.hub.received(function (data) {
                    console.log(data);
                });
                $.connection.hub.error(function (error) {
                    console.warn(error);
                });

                this.gpioHub.client.notifyPinEdge = (device, pinNumber, edge) => {
                    console.log(device + " : " + pinNumber + " " + edge);
                    this.gpioHub.server.writeOutputPinValue(device, 18, edge);
                }

                $.connection.hub.start().done(() => {
         
                });

            });

        }

        public configure() {
            this.gpioHub.server.configureOutputPin(this.device, 18);
            this.gpioHub.server.configureInputPin(this.device, 6);
        }
    }
}