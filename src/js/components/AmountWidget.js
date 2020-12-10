import {settings, select} from '../settings.js';

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
    const event = new CustomEvent('updated', {bubbles: true});
    this.element.dispatchEvent(event);
  }
}
export default AmountWidget;
