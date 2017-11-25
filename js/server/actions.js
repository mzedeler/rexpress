const http = require('http');
const _ = require('lodash');
const actionTypes = require('./actionTypes');

const servers = {};
const requests = {};
let currentRequest = 0;

module.exports = (dispatch) => ({
  listen: (port) => {
    const server = http.createServer((req, res) => {
      currentRequest++;
      requests[currentRequest] = { req, res };
      const doneHandler = (actionType) => () => {
        delete requests[currentRequest];
        dispatch({ type: actionType, id: currentRequest });
      };
      res.on('closed', doneHandler(actionTypes.RESPONSE_CLOSED));
      res.on('finish', doneHandler(actionTypes.RESPONSE_FINISH));
      res.on('end', doneHandler(actionTypes.RESPONSE_END));
      req.on('abort', doneHandler(actionTypes.REQUEST_ABORT));
      req.on('close', doneHandler(actionTypes.REQUEST_CLOSED));
      const { method, url, headers, rawHeaders, httpVersion } = req;
      dispatch({
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
      dispatch({ type: actionTypes.SERVER_LISTEN, port });
    });
  },
  close: (port) => {
    const server = servers[port];
    if (server) {
      delete servers[port];
      server.close();
    }
    dispatch({ type: actionTypes.SERVER_CLOSE, port })
  },
  end(id, data, encoding) {
    const { res } = requests[id];
    if (res) {
      res.end(data, encoding);
      dispatch({ type: actionTypes.RESPONSE_END })
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
      dispatch({
        type: actionTypes.RESPONSE_WRITE_HEAD,
        statusCode,
        statusMessage,
        headers: _.cloneDeep(res.getHeaders()),
      });
    } // else error handling
  }
});
