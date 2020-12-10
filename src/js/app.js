import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';


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
  },
};

app.init();

