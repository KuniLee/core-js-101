/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.create(proto, Object.getOwnPropertyDescriptors(JSON.parse(json)));
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const myError = new Error('Element, id and pseudo-element should not occur more then one time inside the '
  + 'selector if element, id or pseudo-element occurs twice or more times');
const myError2 = new Error('Selector parts should be arranged in the following order: '
  + 'element, id, class, attribute, pseudo-class, pseudo-element" '
  + 'if selector parts arranged in an invalid order');

function checkProps(obj, props) {
  // eslint-disable-next-line no-prototype-builtins
  if (props.some((el) => obj.hasOwnProperty(el))) throw myError2;
}

const methodsMap = {
  element(value) {
    // eslint-disable-next-line no-prototype-builtins
    if (this.hasOwnProperty('_element')) throw myError;
    checkProps(this, ['_id', '_class', '_attr', '_pseudoClass', '_pseudoElement']);
    // eslint-disable-next-line no-underscore-dangle
    this._element = value;
  },
  id(value) {
    // eslint-disable-next-line no-prototype-builtins
    if (this.hasOwnProperty('_id')) throw myError;
    checkProps(this, ['_class', '_attr', '_pseudoClass', '_pseudoElement']);
    // eslint-disable-next-line no-underscore-dangle
    this._id = `#${value}`;
  },
  attr(value) {
    checkProps(this, ['_pseudoClass', '_pseudo-element']);
    // eslint-disable-next-line no-underscore-dangle
    this._attr = this._attr ? `${this._attr}[${value}]` : `[${value}]`;
  },

  class(value) {
    checkProps(this, ['_attr', '_pseudoClass', '_pseudoElement']);
    // eslint-disable-next-line no-underscore-dangle
    this._class = this._class ? `${this._class}.${value}` : `.${value}`;
  },
  pseudoClass(value) {
    checkProps(this, ['_pseudoElement']);
    // eslint-disable-next-line no-underscore-dangle
    this._pseudoClass = this._pseudoClass ? `${this._pseudoClass}:${value}` : `:${value}`;
  },
  pseudoElement(value) {
    // eslint-disable-next-line no-prototype-builtins
    if (this.hasOwnProperty('_pseudoElement')) throw myError;
    // eslint-disable-next-line no-underscore-dangle
    this._pseudoElement = `::${value}`;
  },
};

const cssSelectorBuilder = class {
  constructor() {
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const methodKey in methodsMap) {
      this[methodKey] = (value) => {
        methodsMap[methodKey].call(this, value);
        return this;
      };
    }
  }

  stringify() {
    // eslint-disable-next-line no-underscore-dangle
    let str = this._element || '';
    // eslint-disable-next-line no-underscore-dangle
    str += this._id || '';
    // eslint-disable-next-line no-underscore-dangle
    str += this._class || '';
    // eslint-disable-next-line no-underscore-dangle
    str += this._attr || '';
    // eslint-disable-next-line no-underscore-dangle
    str += this._pseudoClass || '';
    // eslint-disable-next-line no-underscore-dangle
    str += this._pseudoElement || '';
    return str;
  }
};

// eslint-disable-next-line guard-for-in,no-restricted-syntax
for (const methodKey in methodsMap) {
  // eslint-disable-next-line new-cap
  cssSelectorBuilder[methodKey] = (value) => new cssSelectorBuilder()[methodKey](value);
}

cssSelectorBuilder.combine = (selector1, combinator, selector2) => ({
  stringify: () => `${selector1.stringify()} ${combinator} ${selector2.stringify()}`,
});


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
