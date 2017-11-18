const http = require('http');
const EventEmitter = require('events');

const servers = {};
const handlers = {};
const requests = {};
let currentRequest = 0;

module.exports = {
  listen(port) {
    return new Promise((resolve, reject) => {
      const emitter = new EventEmitter();
      const server = http.createServer((req, res) => {
        currentRequest++;
        requests[currentRequest] = { req, res };
        res.on('closed', () => (delete requests[currentRequest]));
        res.on('finish', () => (delete requests[currentRequest]));
        const { method, url, headers, rawHeaders, httpVersion } = req;
        emitter.emit(
          'request',
          {
            requestId: currentRequest,
            httpVersion,
            method,
            url,
            headers,
            rawHeaders,
          }
        );
      });
      server.on('error', reject);
      server.on('close', () => emitter.emit('close'));
      server.listen(port, () => {
        servers[port] = server;
        resolve(emitter);
      });
    });
  },
  close(port) {
    const server = servers[port];
    if (server) {
      delete servers[port];
      server.close();
    }
  },
  addHandler(handlerName, handler) {
    handlers[handlerName] = handler;
  },
  removeHandler(handlerName) {
    return delete handlers[name];
  },
  handleRequest(requestId, handlerName) {
    const { req, res } = requests[requestId];
    const handler = handlers[handlerName];
    if (req) {
      handler(req, res);
    }
  }
};