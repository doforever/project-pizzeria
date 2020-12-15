import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    this.products = [];
    this.getElements(element);
    this.initActions();
  }
  getElements(element){
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
    this.dom.productList = this.dom.wrapper.querySelector(select.cart.productList);
    this.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
    this.dom.subTotalPrice = element.querySelector(select.cart.subTotalPrice);
    this.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    this.dom.totalNumber = element.querySelector(select.cart.totalNumber);
    this.dom.form = element.querySelector(select.cart.form);
    this.dom.address = element.querySelector(select.cart.address);
    this.dom.phone = element.querySelector(select.cart.phone);
  }
  initActions(){
    this.dom.toggleTrigger.addEventListener('click', () => {
      this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    this.dom.productList.addEventListener('updated', () => {
      this.update();
    });
    this.dom.productList.addEventListener('remove', (event) => {
      this.remove(event.detail.cartProduct);
    });
    this.dom.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.sendOrder();
      this.empty();
    });
    this.dom.form.addEventListener('change', (event) => {
      event.preventDefault();
      this.validate(event.target);
    });
  }
  validate(input){
    const isValid = !input.validity.patternMismatch;
    if (!isValid) {
      input.classList.add('error');
      input.setCustomValidity(settings.validityMess[input.name]);
    } else {
      input.classList.remove('error');
      input.setCustomValidity('');
    }
  }

  add(menuProduct){
    /* Generate html */
    const generatedHTML = templates.cartProduct(menuProduct);
    /* Generete DOM element */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /* Add element product list */
    this.dom.productList.appendChild(generatedDOM);
    this.products.push(new CartProduct(menuProduct, generatedDOM));
    this.update();
  }
  update(){
    const wrapper = this.dom.wrapper;
    wrapper.classList.add(classNames.cart.wrapperChanging);
    let deliveryFee = settings.cart.defaultDeliveryFee;
    this.totalNumber = 0;
    this.subTotalPrice = 0;
    for (let product of this.products){

      this.totalNumber = this.totalNumber + product.amount;
      this.subTotalPrice = this.subTotalPrice + product.price;
    }
    if (this.products.length) {
      this.totalPrice = this.subTotalPrice + deliveryFee;
    } else {
      this.totalPrice = 0;
      deliveryFee = 0;
    }
    this.dom.deliveryFee.innerHTML = deliveryFee;
    this.dom.subTotalPrice.innerHTML = this.subTotalPrice;
    for (let total of this.dom.totalPrice){
      total.innerHTML = this.totalPrice;
    }
    this.dom.totalNumber.innerHTML = this.totalNumber;
    setTimeout(function(){ wrapper.classList.remove(classNames.cart.wrapperChanging); },0);
  }
  remove(cartProduct){
    /* remove product html */
    cartProduct.dom.wrapper.remove();
    /* remove product from this.products array */
    const indexOfProduct = this.products.indexOf(cartProduct);
    this.products.splice(indexOfProduct, 1);
    /* call update */
    this.update();
  }
  empty(){
    this.dom.productList.innerHTML = '';
    this.products = [];
    this.dom.phone.value = '';
    this.dom.address.value = '';
    this.update();
  }
  sendOrder(){
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      // address: adres klienta wpisany w koszyku,
      address: this.dom.address.value,
      // phone: numer telefonu wpisany w koszyku,
      phone: this.dom.phone.value,
      // totalPrice: całkowita cena za zamówienie,
      totalPrice: this.totalPrice,
      // subTotalPrice: cena całkowita - koszt dostawy,
      subTotalPrice: this.subTotalPrice,
      // totalNumber: całkowita liczba sztuk,
      totalNumber: this.totalNumber,
      // deliveryFee: koszt dostawy,
      deliveryFee: this.totalPrice - this.subTotalPrice,
      // products: tablica obecnych w koszyku produktów
      products: [],
    };

    for (let prod of this.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify(payload)
    };

    // console.log('sending order', payload);
    fetch(url, options)
      .then((response) => console.log('Order sent, response status:', response.status, response.statusText));
  }
}
export default Cart;
