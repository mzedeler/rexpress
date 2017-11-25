const http = require('http');
const _ = require('lodash');
const actionTypes = require('./actionTypes');

const servers = {};
const requests = {};
let currentRequest = 0;

module.exports = (store) => ({
  listen: (port) => {
    const server = http.createServer((req, res) => {
      currentRequest++;
      requests[currentRequest] = { req, res };
      const doneHandler = (actionType) => () => {
        delete requests[currentRequest];
        store.dispatch({ type: actionType, id: currentRequest });
      };
      res.on('closed', doneHandler(actionTypes.REQUEST_CLOSED));
      res.on('finish', doneHandler(actionTypes.REQUEST_FINISH));
      const { method, url, headers, rawHeaders, httpVersion } = req;
      store.dispatch({
        type: actionTypes.REQUEST_START,
        id: currentRequest,
        httpVersion,
        method,
        url,
        headers,
        rawHeaders,
      });
    });
    const failed = () => console.log('not implemented: failed');
    const closed = () => console.log('not implemented: closed');
    server.on('error', failed);
    server.on('close', closed);
    server.listen(port, () => {
      servers[port] = server;
      store.dispatch({ type: actionTypes.LISTEN, port });
    });
  },
  close: (port) => {
    const server = servers[port];
    if (server) {
      delete servers[port];
      server.close();
    }
    store.dispatch({ type: actionTypes.CLOSE, port })
  },
  end(id, data, encoding) {
    const { res } = requests[id];
    if (res) {
      res.end(data, encoding);
    } // else error handling
  },
  writeHead(id, statusCode, ...rest) {
    const { res } = requests[id];
    if (res) {
      const statusMessage = typeof rest[0] === 'string' ? rest[0] : null;
      const headers = typeof rest === 'object' ? rest[0] : rest[1];

      for(const name in headers) {
        res.setHeader(name, headers[name]);
      }

      res.writeHead(statusCode, statusMessage, headers);
      store.dispatch({
        type: actionTypes.RESPONSE_WRITE_HEAD,
        statusCode,
        statusMessage,
        headers: _.cloneDeep(res.getHeaders()),
      });
    } // else error handling
  }
});
