/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
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
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }
    initAccordion() {
      const thisProduct = this;
      /* add event listner */
      thisProduct.accordionTrigger.addEventListener('click', function(event){
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
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;
      console.log('Product data', thisProduct.id, thisProduct.data);
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('form', thisProduct.id, formData);

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
          const optionImg = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

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
      /* udate price */
      thisProduct.priceElem.innerHTML = price;
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
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
