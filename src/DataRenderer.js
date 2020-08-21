const FORBIDDEN_CLASS = 'nopriceinsert';

const FORBIDDEN_NODES = [
  'SCRIPT',
  'TEMPLATE',
  'INPUT',
  'SELECT',
  'BR',
  'HR',
  'IMG',
];

function formatPrice(value) {
  if (value === 0) return '0';
  if (!value) return '';

  const result = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const parts = result.split('.');
  const decimal = (`${parts[1] || ''}00`).substr(0, 2);

  return `${parts[0]}.${decimal}`;
}

export default class DataRenderer {
  constructor({ dataProvider }) {
    this.elements = {};

    // TODO: find a way to debounce with 1s for each code to optimize performance
    if (dataProvider) {
      dataProvider.on('data', (data) => {
        if (data.code && this.elements[data.code]) {
          this.elements[data.code].forEach(({ price }) => {
            if (price) price.innerText = formatPrice(data.price);
          });
        }
      });
    }
  }

  init(currencies, root) {
    if (!root) return;

    // Remove elements because it's pretty simpler
    // and more solid than check and skip already bounded phrases
    Object.keys(this.elements).forEach((code) => {
      [...this.elements[code]].forEach((item) => {
        if (root.contains(item.wrapper)) {
          item.wrapper.parentNode.removeChild(item.wrapper);
          this.elements[code].splice(this.elements[code].indexOf(item), 1);
        }
      });

      delete this.elements[code];
    });

    currencies.forEach((currency) => {
      this.render(root, currency);
    });
  }

  render(node, currency) {
    if (node.nodeType === Node.TEXT_NODE) {
      const regex = new RegExp(`${currency.phrase}\\b`, 'g');
      let match = regex.exec(node.data);

      if (!match) return;

      const indexes = [];

      while (match) {
        indexes.push(match.index + currency.phrase.length);
        match = regex.exec(node.data);
      }

      let textNode = node;

      for (let i = 0; i < indexes.length; i += 1) {
        const cuttedText = textNode.splitText(indexes[i] - (i > 0 ? indexes[i - 1] : 0));

        textNode.data += ' ';

        textNode.parentNode.insertBefore(this.generateEl(currency), cuttedText);
        textNode = cuttedText;
      }
    }

    if (
      node.nodeType === Node.ELEMENT_NODE
      && !FORBIDDEN_NODES.includes(node.tagName)
      && !node.classList.contains(FORBIDDEN_CLASS)
    ) {
      const children = Array.from(node.childNodes);

      children.forEach((child) => {
        this.render(child, currency);
      });
    }
  }

  generateEl(currency) {
    const wrapper = document.createElement('span');
    wrapper.classList.add(currency.code);

    wrapper.appendChild(document.createTextNode('('));

    if (currency.icon) {
      const icon = document.createElement('img');
      icon.src = `https://cdn.executium.com/media/brands/icons/${currency.icon}.png`;
      icon.classList.add(`${currency.code}__icon`);
      icon.style.width = 'auto';
      icon.style.height = '1em';
      icon.style.verticalAlign = 'middle';
      wrapper.appendChild(icon);
      wrapper.appendChild(document.createTextNode(' '));
    }

    const price = document.createElement('span');
    price.classList.add(`${currency.code}__price`);
    wrapper.appendChild(price);

    wrapper.appendChild(document.createTextNode(')'));

    if (!this.elements[currency.code]) this.elements[currency.code] = [];
    this.elements[currency.code].push({
      wrapper,
      price,
    });

    return wrapper;
  }
}
