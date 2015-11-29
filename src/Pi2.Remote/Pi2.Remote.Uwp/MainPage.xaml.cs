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

namespace Pi2.Remote.Uwp
{ 

    public sealed partial class MainPage : Page
    {
        SignalrBridge _brige;

        public MainPage()
        {
            this.InitializeComponent();
           

            _brige = new SignalrBridge(GpioController.GetDefault(), "http://192.168.1.101:18938/", "Pi");
        }


        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            await _brige.Init();
 
        }

    }
}
