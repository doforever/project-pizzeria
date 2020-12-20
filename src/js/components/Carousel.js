import {select} from '../settings.js';

class Carousel {
  constructor(){
    this.render();
    this.initPlugin();
  }
  render(){
    this.dom = {};
    this.dom.wrapper = document.querySelector(select.widgets.carousel.wrapper);
  }
  initPlugin(){
    // eslint-disable-next-line no-undef
    this.plugin = new Flickity( this.dom.wrapper, {
      // options
      pauseAutoPlayOnHover: false,
      prevNextButtons: false,
      wrapAround: true,
      autoPlay: true,
      cellAlign: 'left',
      contain: true
    });
  }
}

export default Carousel;
