import DataRenderer from './DataRenderer';
import DataProvider from './DataProvider';

const CURRENCIES = [
  {
    phrase: 'Bitcoin',
    code: 'bids-binance-btcusdt',
    icon: 'btc',
  },
  {
    phrase: 'Ethereum',
    code: 'bids-binance-ethusdt',
    icon: 'eth',
  },
];

// Autorun

let dataRenderer;

export default function init(root = document.body) {
  if (!dataRenderer) {
    dataRenderer = new DataRenderer({
      dataProvider: new DataProvider({
        codes: CURRENCIES.map(({ code }) => code),
      }),
      currencies: CURRENCIES,
    });
  }
  dataRenderer.init(CURRENCIES, root);
}

init();
