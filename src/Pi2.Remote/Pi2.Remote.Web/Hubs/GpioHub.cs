using Microsoft.AspNet.SignalR;
using Pi2.Remote.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pi2.Remote.Web.Hubs
{


    public class GpioHub : Hub<IGpioHub>
    {
        public async Task RegisterDevice(string device)
        {
            await Groups.Add(Context.ConnectionId, device);
        }

        public async Task ResetDevice(string device)
        {
            await Clients.Group(device).ResetDevice();
        }


        public async Task ConfigureOutputPin(string device, int pinNumber)
        {
            await Clients.Group(device).ConfigureOutputPin(pinNumber);
        }

        public async Task ConfigureInputPin(string device, int pinNumber)
        {
            await Clients.Group(device).ConfigureInputPin(pinNumber);
        }



        public async Task NotifyPinEdge(string device, int pinNumber, GpioPinEdge edge)
        {
            await Clients.All.NotifyPinEdge(device, pinNumber, edge);
        }

        public async Task NotifyPinValue(string device, int pinNumber, GpioPinValue value)
        {
            await Clients.All.NotifyPinValue(device, pinNumber, value);
        }



        public async Task WriteOutputPinValue(string device, int pinNumber, GpioPinValue value)
        {
            await Clients.Group(device).WriteOutputPinValue(pinNumber, value);
        }

        public async Task ReadPinValue(string device, int pinNumber)
        {
            await Clients.Group(device).ReadPinValue(pinNumber);
        }



        public static void asd()
        {
            var ctx = Microsoft.AspNet.SignalR.GlobalHost.ConnectionManager.GetHubContext<GpioHub, IGpioHub>();

        }
    }

}
