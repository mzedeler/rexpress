const http = require('http');
const _ = require('lodash');
const replug = require('replug');
const actionTypes = require('./actionTypes');

const servers = {};
const requests = {};
let currentRequest = 0;

const { restream } = replug.actions;

module.exports = {
  listen: port => (dispatch) => {
    const server = http.createServer((req, res) => {
      currentRequest += 1;
      requests[currentRequest] = { req, res };
      const reqId = `req.${currentRequest}`;
      const resId = `res.${currentRequest}`;
      restream.register(reqId, req)(dispatch);
      restream.writable(resId, res)(dispatch);

      const doneHandler = actionType => () => {
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
        reqId,
        resId,
        httpVersion,
        method,
        url,
        headers,
        rawHeaders,
      });
    });
    const failed = () => console.log('not implemented: failed'); // eslint-disable-line no-console
    const closed = () => console.log('not implemented: closed'); // eslint-disable-line no-console
    server.on('error', failed);
    server.on('close', closed);
    server.listen(port, () => {
      servers[port] = server;
      dispatch({ type: actionTypes.SERVER_LISTEN, port });
    });
  },
  close: port => (dispatch) => {
    const server = servers[port];
    if (server) {
      delete servers[port];
      server.close();
    }
    dispatch({ type: actionTypes.SERVER_CLOSE, port });
  },
  end: (id, data, encoding) => (dispatch) => {
    const { res } = requests[id];
    if (res) {
      res.end(data, encoding);
      dispatch({ type: actionTypes.RESPONSE_END });
    } // else error handling
  },
  write: (id, chunk, encoding) => (dispatch) => {
    const { res } = requests[id];
    if (res) {
      res.write(chunk, encoding);
      dispatch({ type: actionTypes.RESPONSE_WRITE, chunk, encoding });
    }
  },
  writeHead: (id, statusCode, ...rest) => (dispatch) => {
    const { res } = requests[id];
    if (res) {
      const statusMessage = typeof rest[0] === 'string' ? rest[0] : null;
      const headers = typeof rest === 'object' ? rest[0] : rest[1];

      _.each(headers, (value, name) => res.setHeader(name, value));

      res.writeHead(statusCode, statusMessage, headers);
      dispatch({
        type: actionTypes.RESPONSE_WRITE_HEAD,
        statusCode,
        statusMessage,
        headers: _.cloneDeep(res.getHeaders()),
      });
    } // else error handling
  },
};
