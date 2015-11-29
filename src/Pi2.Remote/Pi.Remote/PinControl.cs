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
        GpioPin pin;

        public int PinNumber { get; private set; }

        GpioController _gpio;

        public PinControl(GpioController gpio, int pinNumber)
        {
            PinNumber = pinNumber;
            _gpio = gpio;
        }

        void TurnPinHigh(GpioController gpio, int pinNumber)
        {
            pin = gpio.OpenPin(pinNumber);

            var pinValue = GpioPinValue.High;
            pin.Write(pinValue);
            pin.SetDriveMode(GpioPinDriveMode.Output);
        }

        void TryTurnPinHigh(GpioController gpio, int pinNumber)
        {
            try
            {
                TurnPinHigh(gpio, pinNumber);
            }
            catch
            {

            }
        }

        public void ConfigureForOutput(int pinNumber, GpioPinValue defaultValue)
        {
            pin = _gpio.OpenPin(pinNumber);
            pin.Write(defaultValue);
            pin.SetDriveMode(GpioPinDriveMode.Output);
        }

        public void ConfigureForInput(int pinNumber, Action<GpioPinEdge> callBack)
        {
            pin = _gpio.OpenPin(pinNumber);

            pin.DebounceTimeout = TimeSpan.FromMilliseconds(50);
            pin.ValueChanged += (sender, args) =>
            {
                callBack(args.Edge);

                //var premuto = args.Edge == GpioPinEdge.FallingEdge;
                //var rilasciato = args.Edge == GpioPinEdge.RisingEdge;
                //var valore = sender.Read();

                //if (premuto)
                //{
                //    output.Write(GpioPinValue.Low);
                //}
                //if (rilasciato)
                //{
                //    output.Write(GpioPinValue.High);
                //}

                Debug.WriteLine(args.Edge + "");
            };

            pin.SetDriveMode(GpioPinDriveMode.Input);
        }


        internal void WriteOutputPinValue(GpioPinValue pinValue)
        {
            pin.Write(pinValue);
        }

        internal GpioPinValue ReadPinValue()
        {
            return pin.Read();
        }

        public void Dispose()
        {
            if (pin != null)
                pin.Dispose();
            if (pin != null)
                pin.Dispose();
        }
    }
}
