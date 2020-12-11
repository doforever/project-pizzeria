import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';


const app = {
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }

  },
  initData: function () {
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.product;
    thisApp.data = {};
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    this.productList = document.querySelector(select.containerOf.menu);
    this.productList.addEventListener('add-to-cart', (event) => {
      app.cart.add(event.detail);
    });
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('settings:', settings);

    thisApp.initData();
    this.initCart();
    this.initPages();
    this.initBooking();
  },
  initPages(){
    this.pages = document.querySelector(select.containerOf.pages).children;
    this.navLinks = document.querySelectorAll(select.nav.links);

    const idFormHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = this.pages[0].id;
    for (let page of this.pages){
      if (page.id == idFormHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    this.activatePage(pageMatchingHash);

    for (let link of this.navLinks){
      link.addEventListener('click', (event) => {
        const clickedElement = event.target;
        event.preventDefault();
        /* get id from href attr */
        const id = clickedElement.getAttribute('href').replace('#', '');
        /* activate Page with id */
        this.activatePage(id);
        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },
  activatePage(pageId){
    /* add class 'active' to matching pages, remove from non-matching */
    for (let page of this.pages){
      page.classList.toggle(
        classNames.pages.active,
        page.id == pageId
      );
    }
    /* add class 'active' to matching links, remove from non-matching */
    for (let link of this.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  initBooking(){
    const bookingContainer = document.querySelector(select.containerOf.booking);
    new Booking(bookingContainer);
  }
};

app.init();

