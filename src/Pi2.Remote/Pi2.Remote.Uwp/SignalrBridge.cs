using Microsoft.AspNet.SignalR.Client;
using Pi.Remote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Devices.Gpio;

namespace Pi2.Remote.Uwp
{
    class SignalrBridge
    {
        SetupGpio _setup;
        HubConnection _hubConnection;
        string _device;

        public SignalrBridge(GpioController gpio, string url, string device)
        {
            _setup = new SetupGpio(gpio);
            _hubConnection = new HubConnection(url);
            _device = device;
        }
        public async Task Init()
        {
            IHubProxy proxy = _hubConnection.CreateHubProxy("GpioHub");

            proxy.On<int>("ConfigureOutputPin", pinNumber =>
            {
                _setup.ConfigureOutputPin(pinNumber);
            });

            proxy.On<int>("ConfigureInputPin", pinNumber =>
            {
                _setup.ConfigureInputPin(pinNumber, edge =>
                {
                    proxy.Invoke("NotifyPinEdge", _device, pinNumber, edge);
                });
            });

            proxy.On<int, GpioPinValue>("WriteOutputPinValue", (pinNumber, pinValue) =>
            {
                _setup.WriteOutputPinValue(pinNumber, pinValue);
            });

            proxy.On<int>("ReadPinValue", (pinNumber) =>
            {
                var value = _setup.ReadPinValue(pinNumber);

                proxy.Invoke("NotifyPinValue", _device, pinNumber, value);

            });


            proxy.On("ResetDevice", () =>
            {
                _setup.Reset();
            });

            _hubConnection.StateChanged += async (ev) => {
                if (ev.NewState == ConnectionState.Disconnected)
                {
                    await _hubConnection.Start();
                    await proxy.Invoke("RegisterDevice", _device);
                }
            };


            await _hubConnection.Start();

            await proxy.Invoke("RegisterDevice", _device);
        }
    }
}
