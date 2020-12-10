import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Product{
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.dom = {};
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }
  renderInMenu() {
    const thisProduct = this;

    /* Generate html */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* Generete DOM element */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* Find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* Add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }
  getElements() {
    const thisProduct = this;
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion() {
    const thisProduct = this;
    /* add event listner */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
      /* prevent default */
      event.preventDefault();
      /* find active */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      /* if it's not this element remove active */
      if (activeProduct && (!(activeProduct === thisProduct.element))) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active on clicked element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }
  initOrderForm() {
    const thisProduct = this;
    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
      thisProduct.restoreDefault();
    });
  }
  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget (thisProduct.dom.amountWidgetElem);
    this.dom.amountWidgetElem.addEventListener('updated', () => {
      this.processOrder();
    });
  }
  processOrder() {
    const thisProduct = this;
    // console.log('Product data', thisProduct.id, thisProduct.data);
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    // console.log('form', thisProduct.id, formData);

    /* set price to default */
    let price = thisProduct.data.price;

    /* for every category */
    for (let paramId in thisProduct.data.params){
    /* determine param value */
      const param = thisProduct.data.params[paramId];
      /* for every option */
      for (let optionId in param.options) {
      /* determine option value */
        const option = param.options[optionId];

        /* find image with class .paramId-optionId */
        const optionImg = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        /* determine if option is checked */
        const isChecked = formData[paramId].includes(optionId);
        const isDefault = option.default;

        /* if checked add image to wrapper */
        if (optionImg) {
          isChecked ? optionImg.classList.add(classNames.menuProduct.imageVisible) : optionImg.classList.remove(classNames.menuProduct.imageVisible);
        }

        /* determine impact on price */
        if (isChecked && !isDefault) {
          price = price + option.price;
        } else if (!isChecked && isDefault) {
          price = price - option.price;
        }
      }
    }
    thisProduct.priceSingle = price;
    /* multiply price by amount */
    price = price * thisProduct.amountWidget.value;
    /* udate price */
    thisProduct.dom.priceElem.innerHTML = price;
  }
  restoreDefault(){
    this.dom.form.reset();
    this.amountWidget.setValue(settings.amountWidget.defaultValue);
    this.processOrder();
  }
  prepareCartProductParams(){
    const cartProductParams = {};
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    /* for every category */
    for (let paramId in thisProduct.data.params){
    /* determine param value */
      const param = thisProduct.data.params[paramId];
      cartProductParams[paramId] = {};
      cartProductParams[paramId].label = param.label;
      cartProductParams[paramId].options = {};
      // /* for every option */
      for (let optionId in param.options) {
      /* determine option value */
        const option = param.options[optionId];
        /* determine if option is checked */
        const isChecked = formData[paramId].includes(optionId);
        /* add to options in cart params object */
        if (isChecked ) {
          cartProductParams[paramId].options[optionId] = option.label;
        }
      }
    }
    return cartProductParams;
  }
  prepareCartProduct(){
    const productSummary = {};
    productSummary.id = this.id;
    productSummary.name = this.data.name;
    productSummary.amount = this.amountWidget.value;
    productSummary.priceSingle = this.priceSingle;
    productSummary.price = productSummary.amount * productSummary.priceSingle;
    productSummary.params = this.prepareCartProductParams();

    return productSummary;
  }
  addToCart(){
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: this.prepareCartProduct(),
    });
    this.element.dispatchEvent(event);
  }
}

export default Product;
