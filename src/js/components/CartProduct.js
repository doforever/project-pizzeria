import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';


class CartProduct {
  constructor(menuProduct, element) {
    this.id = menuProduct.id;
    this.name = menuProduct.name;
    this.amount = menuProduct.amount;
    this.price = menuProduct.price;
    this.priceSingle = menuProduct.priceSingle;
    this.params = menuProduct.params;
    this.getElements(element);
    this.initAmountWidget();
    this.initActions();
  }
  getElements(element){
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
    this.dom.price = element.querySelector(select.cartProduct.price);
    this.dom.edit = element.querySelector(select.cartProduct.edit);
    this.dom.remove = element.querySelector(select.cartProduct.remove);
  }
  initActions(){
    this.dom.edit.addEventListener('click', (event) => {
      event.preventDefault();
    });
    this.dom.remove.addEventListener('click', (event) => {
      event.preventDefault();
      this.remove();
    });
  }
  initAmountWidget(){
    this.amountWidget = new AmountWidget (this.dom.amountWidget);
    this.amountWidget.setValue(this.amount);
    this.dom.amountWidget.addEventListener('updated', () => {
      this.amount = this.amountWidget.value;
      this.price = this.priceSingle * this.amount;
      this.dom.price.innerHTML = this.price;
    });
  }
  remove(){
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: this,
      },
    });
    this.dom.wrapper.dispatchEvent(event);
  }
  getData(){
    return {
      id: this.id,
      amount: this.amount,
      price: this.price,
      priceSingle: this.priceSingle,
      name: this.name,
      params: this.params,
    };
  }
}
export default CartProduct;
