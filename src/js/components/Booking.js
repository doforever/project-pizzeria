import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(container) {
    this.pickedTable = '';
    this.render(container);
    this.renderAlert();
    this.initWidgets();
    this.getData();
    this.initActions();
  }
  render(container) {
    const generatedHTML = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = container;
    this.dom.wrapper.innerHTML = generatedHTML;

    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.floorPlan = this.dom.wrapper.querySelector(select.booking.floorPlan);
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);

  }
  initWidgets() {
    this.peopleAmount = new AmountWidget (this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget (this.dom.hoursAmount);
    this.datePicker = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener('updated', () => {
      this.updateDOM();
    });
  }
  initActions(){
    /* click to pick a table */
    this.dom.floorPlan.addEventListener('click', (event) => {
      if (event.target.classList.contains(classNames.booking.table)){
        this.pickTable(event.target);
        this.updateDOM();
      }
    });
  }
  renderAlert() {
    const alert = document.createElement('div');
    alert.innerHTML = `<p>${settings.booking.unavailableMess}</p>`;
    alert.classList.add(classNames.booking.alert);
    /* add the newly created element and it's content into the DOM */
    this.dom.wrapper.prepend(alert);
    this.dom.alert = alert;
  }
  pickTable(table){
    function hide(alert){
      setTimeout(() => {alert.classList.remove(classNames.booking.showAlert);}, 1000);
    }
    /* check if table is booked */
    if (!table.classList.contains(classNames.booking.tableBooked)){
      /* save picked table to Booking */
      if (table != this.pickedTable){
        this.pickedTable = table;
      }
    } else {
      this.dom.alert.classList.add(classNames.booking.showAlert);
      hide(this.dom.alert);
    }
  }
  getData(){

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(this.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params', params);

    const urls = {
      bookings:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };

    const thisBooking = this;

    // console.log('getData urls', urls);
    Promise.all([
      fetch (urls.bookings),
      fetch (urls.eventsCurrent),
      fetch (urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log('bookings', bookings);
        // console.log('eventsCurrent', eventsCurrent);
        // console.log('eventsRepeat', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    this.booked = {};
    for(let item of eventsCurrent){
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of bookings){
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = this.datePicker.minDate;
    const maxDate = this.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){
          this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log('booked', this.booked);
    this.updateDOM();
  }
  makeBooked(date, hour, duration, table){

    if(typeof this.booked[date] == 'undefined'){
      this.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if (typeof this.booked[date][hourBlock] == 'undefined'){
        this.booked[date][hourBlock] = [];
      }
      this.booked[date][hourBlock].push(table);
    }
  }
  updateDOM(){
    /* TODO update picked tables */
    console.log('need to udpate picked tables!');
    this.date = this.datePicker.value;
    this.hour = utils.hourToNumber(this.hourPicker.value);

    let allAvailable = false;

    if(
      typeof this.booked[this.date] == 'undefined'
      ||
      typeof this.booked[this.date][this.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of this.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        this.booked[this.date][this.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }
}

export default Booking;
