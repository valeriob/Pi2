using Pi.Remote;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using Windows.Devices.Gpio;
using Microsoft.AspNet.SignalR.Client;
using System.Threading.Tasks;
// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace Pi2.Remote.Uwp
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        SetupGpio _setup;
        HubConnection _hubConnection;
        string device = "Pi";

        public MainPage()
        {
            this.InitializeComponent();
            _setup = new SetupGpio(GpioController.GetDefault());


        }


        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            _hubConnection = new HubConnection("http://192.168.1.101:18938/");
            IHubProxy proxy = _hubConnection.CreateHubProxy("GpioHub");

            proxy.On<int>("ConfigureOutputPin", pinNumber =>
            {
                _setup.ConfiguraOutputPin(pinNumber);
            });

            proxy.On<int>("ConfigureInputPin", pinNumber =>
            {
                _setup.ConfiguraInputPin(pinNumber, edge =>
                {
                    proxy.Invoke("NotifyPinEdge", device, pinNumber, edge);
                });
            });

            proxy.On<int, GpioPinValue>("WriteOutputPinValue", (pinNumber, pinValue) =>
            {
                _setup.WriteOutputPinValue(pinNumber, pinValue);
            });

            proxy.On<int>("ReadPinValue", (pinNumber) =>
            {
                var value = _setup.ReadPinValue(pinNumber);

                proxy.Invoke("NotifyPinValue", device, pinNumber, value);

            });



            await _hubConnection.Start();

            await proxy.Invoke("RegisterDevice", device);
        }
    }
}
