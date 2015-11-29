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
using System.ComponentModel;
using System.Windows.Input;

namespace Pi2.Remote.Uwp
{ 

    public sealed partial class MainPage : Page
    { 
        MainViewModel _viewModel;
        public MainPage()
        {
            this.InitializeComponent();

            DataContext = _viewModel = new MainViewModel();

        }


        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
           await _viewModel.Init();
 
        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            await _viewModel.Init();
        }
    }

    public class MainViewModel : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;
        SignalrBridge _brige;

        string _url;
        public string Url
        {
            get { return _url; }
            set { _url = value; OnPropertyChanged("Url"); }
        }

        string _device;
        public string Device
        {
            get { return _device; }
            set { _device = value; OnPropertyChanged("Device"); }
        }


        public MainViewModel()
        {
            _url = "http://192.168.1.101:18938/";
            _device = "Pi";
            _brige = new SignalrBridge(GpioController.GetDefault());
        }

        public async Task Init()
        {
            await _brige.Init(_url, Device);
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            if (PropertyChanged != null)
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
