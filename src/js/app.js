import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Carousel from './components/Carousel.js';

const app = {
  initMenu: function () {
    for (let productData in this.data.products) {
      new Product(this.data.products[productData].id, this.data.products[productData]);
    }

  },
  init: function () {
    console.log('*** App starting ***');
    console.log('thisApp:', this);
    console.log('settings:', settings);

    this.initData();
    this.initCart();
    this.initPages();
    this.initBooking();
    this.initCarousel();
  },
  initData: function () {
    const url = settings.db.url + '/' + settings.db.product;
    this.data = {};
    fetch(url)
      .then((rawResponse) => {
        return rawResponse.json();
      })
      .then((parsedResponse) => {
        this.data.products = parsedResponse;
        this.initMenu();
      });
  },
  initCart: function () {
    const cartElem = document.querySelector(select.containerOf.cart);
    this.cart = new Cart(cartElem);
    this.productList = document.querySelector(select.containerOf.menu);
    this.productList.addEventListener('add-to-cart', (event) => {
      app.cart.add(event.detail);
    });
  },
  initPages: function () {
    this.pages = document.querySelector(select.containerOf.pages).children;
    this.navLinks = document.querySelectorAll(select.nav.links);
    this.homeLinks = document.querySelectorAll(select.home.links);

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

    for (let link of this.homeLinks) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const id = link.getAttribute('data-link');
        this.activatePage(id);
        window.location.hash = '#/' + id;
      });
    }
  },
  activatePage: function (pageId) {
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
  initBooking: function (){
    const bookingContainer = document.querySelector(select.containerOf.booking);
    new Booking(bookingContainer);
  },
  initCarousel: function(){
    new Carousel();
  }
};

app.init();

