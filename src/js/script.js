/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart : {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct : {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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
      app.cart.add(this.prepareCartProduct());
    }
  }

  class AmountWidget {
    constructor(element, value = settings.amountWidget.defaultValue) {
      this.getElements(element);
      this.setValue(value);
      this.initActions();

      // console.log('Amount wiget', this);
      // console.log('constructor arguments:', element );
    }
    getElements(element) {

      this.element = element;
      this.input = this.element.querySelector(select.widgets.amount.input);
      this.linkDecrease = this.element.querySelector(select.widgets.amount.linkDecrease);
      this.linkIncrease = this.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const newValue = parseInt(value);

      /* TODO: add validation */
      if (this.value!==newValue && !isNaN(newValue)
      && newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin){
        this.value = newValue;
        this.announce();
      }
      this.input.value = this.value;
    }
    initActions() {
      this.input.addEventListener('change', () => {
        this.setValue(this.input.value);
      });
      this.linkDecrease.addEventListener('click', event => {
        event.preventDefault();
        this.setValue(this.input.value - 1);
      });
      this.linkIncrease.addEventListener('click', event => {
        event.preventDefault();
        this.setValue(parseInt(this.input.value) + 1);
      });
    }
    announce() {
      const event = new Event('updated');
      this.element.dispatchEvent(event);
    }
  }
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
    }
    initActions(){
      this.dom.toggleTrigger.addEventListener('click', () => {
        this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
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
      console.log('cart',this);
    }
    update(){
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
      for (let product of this.products){
        totalNumber = totalNumber + product.amount;
        subtotalPrice = subtotalPrice + product.price;
      }
      if (subtotalPrice) {
        this.totalPrice = subtotalPrice + deliveryFee;
      } else {
        this.totalPrice = 0;
      }
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      this.id = menuProduct.id;
      this.name = menuProduct.name;
      this.amount = menuProduct.amount;
      this.price = menuProduct.price;
      this.priceSingle = menuProduct.priceSingle;
      this.getElements(element);
      this.initAmountWidget();
    }
    getElements(element){
      this.dom = {};
      this.dom.wrapper = element;
      this.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      this.dom.price = element.querySelector(select.cartProduct.price);
      this.dom.edit = element.querySelector(select.cartProduct.edit);
      this.dom.remove = element.querySelector(select.cartProduct.remove);
    }
    initAmountWidget(){
      this.amountWidget = new AmountWidget (this.dom.amountWidget, this.amount);
      this.dom.amountWidget.addEventListener('updated', () => {
        this.amount = this.amountWidget.value;
        this.price = this.priceSingle * this.amount;
        this.dom.price.innerHTML = this.price;
      });
    }
  }

  const app = {
    initMenu : function(){
      const thisApp = this;
      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      this.initCart();
    },
  };

  app.init();
}
