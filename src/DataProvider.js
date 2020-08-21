import io from 'socket.io-client/dist/socket.io.slim';

const MASTER_SOCKET_NAME = 'wss-public.executium.com';

function createSocket(name) {
  return io(`https://${name}:2083`, {
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 500,
    reconnectionAttempts: 100,
  });
}

function parseCode(code) {
  const [side, exchange, symbol] = code.split('-');
  return { side, exchange, symbol };
}

function useSocketErrorsLogging(socket) {
  ['error', 'connect_error'].forEach((eventName) => {
    socket.on(eventName, (err) => {
      console.error(err);
    });
  });
}

function useSocketReconnecting(socket) {
  socket.on('disconnect', (reason) => {
    // https://socket.io/docs/client-api/#Event-%E2%80%98disconnect%E2%80%99
    if (reason === 'io server disconnect') {
      socket.connect();
    }

    // TODO: handle 'ping timeout' reason?
  });
}

function genSubscriptionName(code, level = 1) {
  const { side, exchange, symbol } = parseCode(code);
  return `${side}/${exchange}-${symbol}-${level}`;
}

function noop() {}

export default class DataProvider {
  constructor({ codes }) {
    this.masterSocket = null;
    this.dataSockets = [];
    this.data = {};
    this.listeners = {};

    this.createMasterSocket();

    codes.forEach((code) => {
      const { side, exchange, symbol } = parseCode(code);
      this.requestDataSource(side, exchange, symbol).catch(noop);
    });
  }

  createMasterSocket() {
    if (!this.masterSocket) {
      this.masterSocket = createSocket(MASTER_SOCKET_NAME);

      // Socket io events
      useSocketErrorsLogging(this.masterSocket);
      useSocketReconnecting(this.masterSocket);

      this.masterSocket.on('reconnect_failed', () => {
        console.error('Failed to reconnect to master socket');
      });

      // New data subscription available
      this.masterSocket.on('obreq', (data) => {
        // Data example:
        // { n: '8e8e16d7.executium.net', s: 'binance-btcusdt', o: 'bids-binance-btcusdt' }
        // { n: '8e8e16d7.executium.net', s: 'binance-ethusdt', o: 'bids-binance-ethusdt' }
        if (data.n === 'notavailable') return;
        this.subscribeToDataSource(data.n, data.o);
      });
    }

    return this.masterSocket;
  }

  createDataSocket(name) {
    if (!this.dataSockets[name]) {
      const socket = createSocket(name);

      // Socket io events
      useSocketErrorsLogging(socket);
      useSocketReconnecting(socket);

      // On data socket connection lost, remove it and request data for its subscriptions
      socket.on('reconnect_failed', () => {
        const { subscriptions } = this.dataSockets[name];
        this.removeDataSocket(name);

        subscriptions.forEach((code) => {
          const { side, exchange, symbol } = parseCode(code);
          this.requestDataSource(side, exchange, symbol).catch(noop);
        });
      });

      // Change data source
      socket.on('mvsym', (data) => {
        const { side, exchange, symbol } = parseCode(data);
        this.unsubscribeFromDataSource(name, data);
        this.requestDataSource(side, exchange, symbol).catch(noop);
      });

      // New data
      socket.on('dp', (data) => {
        // Data:
        // { n: 'bids/binance-btcusdt-1', d: '[11799.63,0.016625,1597930775340]' }
        // { n: 'bids/binance-ethusdt-1', d: '[410.97,8,1597930775481]' }
        try {
          const [price, qty, date] = JSON.parse(data.d);
          const [
            side,
            exchange,
            symbol,
          ] = data.n.replace('/', '-').split('-');

          const code = [side, exchange, symbol].join('-');

          this.data[code] = {
            server: name,
            code,
            price,
            date,
            qty,
          };

          this.emit('data', this.data[code]);
        } catch (err) {
          console.error(err);
        }
      });

      this.dataSockets[name] = {
        socket,
        name,
        subscriptions: [],
      };
    }
    return this.dataSockets[name];
  }

  removeDataSocket(name) {
    if (!this.dataSockets[name]) return;

    const { socket, subscriptions } = this.dataSockets[name];

    if (socket.connected) {
      subscriptions.forEach((subscription) => {
        socket.send({ unsubscribe: subscription });
      });
    }

    socket.disconnect();

    delete this.dataSockets[name];
  }

  subscribeToDataSource(socketName, code) {
    const {
      socket,
      subscriptions,
    } = this.dataSockets[socketName] || this.createDataSocket(socketName);

    if (subscriptions.includes(code)) return;

    // TODO: chek if it works correctly if socket is reconnecting
    socket.send({ subscribe: genSubscriptionName(code) });
    subscriptions.push(code);
  }

  unsubscribeFromDataSource(socketName, code) {
    if (this.dataSockets[socketName]) return;
    const { socket, subscriptions } = this.dataSockets[socketName];

    if (!subscriptions.includes(code)) return;

    // TODO: chek if it works correctly if socket is reconnecting
    socket.send({ unsubscribe: genSubscriptionName(code) });
    subscriptions.splice(subscriptions.indexOf(code), 1);
  }

  async getMasterSocket() {
    return new Promise((resolve, reject) => {
      const socket = this.masterSocket || this.createMasterSocket();
      if (socket.connected) {
        resolve(socket);
        return;
      }

      socket.once('connect', () => {
        socket.off('reconnect_failed', reject);
        resolve(socket);
      });

      socket.once('reconnect_failed', reject);
    });
  }

  async requestDataSource(side, exchange, symbol) {
    try {
      const socket = await this.getMasterSocket();
      socket.send({
        req: exchange,
        s: symbol,
        o: [side, exchange, symbol].join('-'),
      });
    } catch (err) { /* do nothing */ }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((handler) => handler(data));
    }
  }

  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be function');
    }

    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    if (!this.listeners[event].includes(handler)) {
      this.listeners[event].push(handler);
    }

    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.listeners[event]) return;

    const index = this.listeners[event].indexOf(handler);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  }
}
