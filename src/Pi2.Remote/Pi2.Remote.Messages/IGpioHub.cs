using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pi2.Remote.Messages
{
    public interface IGpioHub
    {
        Task ConfigureOutputPin(int pinNumber);
        Task ConfigureInputPin(int pinNumber);

        Task WriteOutputPinValue(int pinNumber, GpioPinValue value);
        Task ReadPinValue(int pinNumber);


        Task NotifyPinEdge(string device, int pinNumber, GpioPinEdge edge);

        Task NotifyPinValue(string device, int pinNumber, GpioPinValue value);

        
    }

    //

    public enum GpioPinEdge
    {
        
        FallingEdge = 0,
        RisingEdge = 1
    }

    public enum GpioPinValue
    {
        Low = 0,
        High = 1
    }
}
