using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Pi2.Remote.Web.Controllers
{
    public partial class PiController : Controller
    {
        public virtual ActionResult Index()
        {
            return View();
        }


    }
}