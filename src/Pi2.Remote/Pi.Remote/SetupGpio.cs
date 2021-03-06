﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Devices.Gpio;

namespace Pi.Remote
{
    public class SetupGpio : IDisposable
    {
        GpioController _gpio;
        List<PinControl> _controls;

        public SetupGpio(GpioController gpio)
        {
            _gpio = gpio;
            _controls = new List<PinControl>();
        }

        public void ConfigureOutputPin(int pinNumber)
        {
            var control = new PinControl(_gpio, pinNumber);
            control.ConfigureForOutput(pinNumber, GpioPinValue.High);
            _controls.Add(control);
        }

        public void ConfigureInputPin(int pinNumber, Action<GpioPinEdge> callback)
        {
            var control = new PinControl(_gpio, pinNumber);
            control.ConfigureForInput(pinNumber, callback);
            _controls.Add(control);
        }
        public void WriteOutputPinValue(int pinNumber, GpioPinValue pinValue)
        {
            foreach (var c in _controls.Where(r => r.PinNumber == pinNumber))
            {
                c.WriteOutputPinValue(pinValue);
            }
        }

        public GpioPinValue ReadPinValue(int pinNumber)
        {
            foreach (var c in _controls.Where(r => r.PinNumber == pinNumber))
            {
                return c.ReadPinValue();
            }

            throw new Exception("pin not configured");
        }

        public void Reset()
        {
            foreach (var control in _controls)
            {
                control.Dispose();
            }

            _controls.Clear();
        }


        public void Dispose()
        {
            foreach (var control in _controls)
            {
                control.Dispose();
            }
        }

    }

}
