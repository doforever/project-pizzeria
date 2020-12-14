import {settings, select, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Product{
  constructor(id, data) {
    this.id = id;
    this.data = data;
    this.dom = {};
    this.renderInMenu();
    this.getElements();
    this.initAccordion();
    this.initOrderForm();
    this.initAmountWidget();
    this.processOrder();
  }
  renderInMenu() {
    /* Generate html */
    const generatedHTML = templates.menuProduct(this.data);
    /* Generete DOM element */
    this.element = utils.createDOMFromHTML(generatedHTML);
    /* Find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* Add element to menu */
    menuContainer.appendChild(this.element);
  }
  getElements() {
    this.dom.accordionTrigger = this.element.querySelector(select.menuProduct.clickable);
    this.dom.form = this.element.querySelector(select.menuProduct.form);
    this.dom.formInputs = this.element.querySelectorAll(select.all.formInputs);
    this.dom.cartButton = this.element.querySelector(select.menuProduct.cartButton);
    this.dom.priceElem = this.element.querySelector(select.menuProduct.priceElem);
    this.dom.imageWrapper = this.element.querySelector(select.menuProduct.imageWrapper);
    this.dom.amountWidgetElem = this.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion() {
    /* add event listner */
    this.dom.accordionTrigger.addEventListener('click', (event) => {
      /* prevent default */
      event.preventDefault();
      /* find active */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      /* if it's not this element remove active */
      if (activeProduct && (!(activeProduct === this.element))) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active on clicked element */
      this.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }
  initOrderForm() {
    this.dom.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.processOrder();
    });

    for (let input of this.dom.formInputs){
      input.addEventListener('change', () => {
        this.processOrder();
      });
    }

    this.dom.cartButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.processOrder();
      this.addToCart();
      this.restoreDefault();
    });
  }
  initAmountWidget(){
    this.amountWidget = new AmountWidget (this.dom.amountWidgetElem);
    this.dom.amountWidgetElem.addEventListener('updated', () => {
      this.processOrder();
    });
  }
  processOrder() {
    // console.log('Product data', this.id, this.data);
    const formData = utils.serializeFormToObject(this.dom.form);
    // console.log('form', this.id, formData);

    /* set price to default */
    let price = this.data.price;

    /* for every category */
    for (let paramId in this.data.params){
    /* determine param value */
      const param = this.data.params[paramId];
      /* for every option */
      for (let optionId in param.options) {
      /* determine option value */
        const option = param.options[optionId];

        /* find image with class .paramId-optionId */
        const optionImg = this.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

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
    this.priceSingle = price;
    /* multiply price by amount */
    price = price * this.amountWidget.value;
    /* udate price */
    this.dom.priceElem.innerHTML = price;
  }
  restoreDefault(){
    this.dom.form.reset();
    this.amountWidget.setValue(settings.amountWidget.defaultValue);
    this.processOrder();
  }
  prepareCartProductParams(){
    const cartProductParams = {};
    const formData = utils.serializeFormToObject(this.dom.form);

    /* for every category */
    for (let paramId in this.data.params){
    /* determine param value */
      const param = this.data.params[paramId];
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
