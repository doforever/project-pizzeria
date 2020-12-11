import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(container) {
    this.render(container);
    this.initWidgets();
  }
  render(container) {
    const generatedHTML = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = container;
    this.dom.wrapper.innerHTML = generatedHTML;

    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
  }
  initWidgets() {
    this.peopleAmount = new AmountWidget (this.dom.peopleAmount);
    this.dom.peopleAmount.addEventListener('updated', () => {

    });
    this.hoursAmount = new AmountWidget (this.dom.hoursAmount);
    this.dom.hoursAmount.addEventListener('updated', () => {

    });
  }
}

export default Booking;
