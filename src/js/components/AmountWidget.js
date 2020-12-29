import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element, step = settings.amountWidget.defaultStep) {
    super(element, settings.amountWidget.defaultValue);
    this.correctMaxValue = settings.amountWidget.defaultMax;
    this.step = step;
    this.getElements(element);
    this.initActions();
  }
  set maxValue(value) {
    this.correctMaxValue = value;
    if (value < this.correctValue) {
      this.value = this.correctMaxValue;
    }
  }
  getElements() {
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.amount.input);
    this.dom.linkDecrease = this.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    this.dom.linkIncrease = this.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  isValid(value) {
    return !isNaN(value)
      && value <= this.correctMaxValue
      && value >= this.step;
  }
  renderValue() {
    this.dom.input.value = this.value;
  }
  initActions() {
    this.dom.input.addEventListener('change', () => {
      this.setValue(this.dom.input.value);
    });
    this.dom.linkDecrease.addEventListener('click', event => {
      event.preventDefault();
      this.setValue(this.dom.input.value - this.step);
    });
    this.dom.linkIncrease.addEventListener('click', event => {
      event.preventDefault();
      this.setValue(parseFloat(this.dom.input.value) + this.step);
    });
  }
}
export default AmountWidget;
