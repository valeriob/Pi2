using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Devices.Gpio;

namespace Pi.Remote
{
    public class PinControl : IDisposable
    {
        public int PinNumber { get; private set; }
        GpioController _gpio;
        GpioPin _pin;

        public PinControl(GpioController gpio, int pinNumber)
        {
            PinNumber = pinNumber;
            _gpio = gpio;
        }


        public void ConfigureForOutput(int pinNumber, GpioPinValue defaultValue)
        {
            _pin = _gpio.OpenPin(pinNumber);
            _pin.Write(defaultValue);
            _pin.SetDriveMode(GpioPinDriveMode.Output);
        }

        public void ConfigureForInput(int pinNumber, Action<GpioPinEdge> callBack)
        {
            _pin = _gpio.OpenPin(pinNumber);

            _pin.DebounceTimeout = TimeSpan.FromMilliseconds(50);
            _pin.ValueChanged += (sender, args) =>
            {
                callBack(args.Edge);

                Debug.WriteLine(args.Edge + "");
            };

            _pin.SetDriveMode(GpioPinDriveMode.Input);
        }


        internal void WriteOutputPinValue(GpioPinValue pinValue)
        {
            _pin.Write(pinValue);
        }

        internal GpioPinValue ReadPinValue()
        {
            return _pin.Read();
        }

        public void Dispose()
        {
            if (_pin != null)
                _pin.Dispose();
        }
    }
}
