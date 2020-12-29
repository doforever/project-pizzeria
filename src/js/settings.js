export const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product',
    bookingWidget: '#template-booking-widget',
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
    pages: '#pages',
    booking: '.booking-wrapper',
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
      input: 'input.amount',
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
    datePicker: {
      wrapper: '.date-picker',
      input: `input[name="date"]`,
    },
    hourPicker: {
      wrapper: '.hour-picker',
      input: 'input[type="range"]',
      output: '.output',
      rangeSlider: '.rangeSlider',
    },
    carousel: {
      wrapper: '.main-carousel',
    }
  },
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subTotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
  booking: {
    peopleAmount: '.people-amount',
    hoursAmount: '.hours-amount',
    floorPlan: '.floor-plan',
    tables: '.floor-plan .table',
    tablePicked: '.picked',
    submit: '.booking-form [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
    starters: '.booking-options [type="checkbox"][name="starter"]',
  },
  nav: {
    links: '.main-nav a',
  },
  home: {
    links: '.box-nav',
  }
};

export const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  cart: {
    wrapperActive: 'active',
    wrapperChanging: 'changing',
  },
  booking: {
    loading: 'loading',
    tableBooked: 'booked',
    table: 'table',
    tablePicked: 'picked',
    alert: 'alert',
    showAlert: 'show',
  },
  widgets: {
    hourPicker: 'hour-picker',
    amountWidget: 'widget-amount',
  },
  nav: {
    active: 'active',
  },
  pages: {
    active: 'active',
  },
  home: {
    link: 'box-nav',
  }
};

export const settings = {
  hours: {
    open: 12,
    close: 24,
    step: 0.5,
  },
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 10,
    defaultStep: 1,
  },
  datePicker: {
    maxDaysInFuture: 14,
  },
  cart: {
    defaultDeliveryFee: 20,
  },
  floorPlan: {
    tableAmount: 3,
  },
  booking: {
    tableIdAttribute: 'data-table',
    unavailableMess: 'Sorry, this table is anavailable'
  },
  db: {
    url: '//' + window.location.hostname + (window.location.hostname=='localhost' ? ':3131' : ''),
    product: 'product',
    order: 'order',
    booking: 'booking',
    event: 'event',
    dateStartParamKey: 'date_gte',
    dateEndParamKey: 'date_lte',
    notRepeatParam: 'repeat=false',
    repeatParam: 'repeat_ne=false',
  },
  validityMess: {
    phone: 'Insert a valid phone number starting with +',
    address: 'Your address is too short',
  },
};

export const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  bookingWidget: Handlebars.compile(document.querySelector(select.templateOf.bookingWidget).innerHTML),
};
