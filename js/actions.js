/* eslint-disable max-len */
const actionTypes = require('./actionTypes');

module.exports = {
  serverListen(port) { return { type: actionTypes.SERVER_LISTEN, port }; },
  serverListenDone(port) { return { type: actionTypes.SERVER_LISTEN_DONE, port }; },
  serverListenFailed(port, error) { return { type: actionTypes.SERVER_LISTEN_FAILED, port, error }; },
  serverClose(port) { return { type: actionTypes.SERVER_CLOSE, port }; },
  serverCloseDone(port) { return { type: actionTypes.SERVER_DONE, port }; },
  serverCloseFailed(port, error) { return { type: actionTypes.SERVER_CLOSE_FAILED, port, error }; },
  requestStart(id, reqId, resId, httpVersion, method, url, headers, rawHeaders) {
    return {
      type: actionTypes.REQUEST_START,
      id,
      reqId,
      resId,
      httpVersion,
      method,
      url,
      headers,
      rawHeaders
    };
  },
  requestClose(id) { return { type: actionTypes.REQUEST_CLOSE, id }; },
  requestAbort(id) { return { type: actionTypes.REQUEST_ABORT, id }; },
  responseWrite(id, chunk, encoding) {
    return { type: actionTypes.RESPONSE_WRITE, id, chunk, encoding };
  },
  responseWriteDone(id, chunk, encoding) {
    return { type: actionTypes.RESPONSE_WRITE_DONE, id, chunk, encoding };
  },
  responseWriteHead(id, statusCode, ...rest) {
    const statusMessage = typeof rest[0] === 'string' ? rest[0] : null;
    const headers = typeof rest === 'object' ? rest[0] : rest[1];
    return {
      type: actionTypes.RESPONSE_WRITE_HEAD,
      id,
      statusCode,
      statusMessage,
      headers,
    };
  },
  responseWriteHeadDone(id, statusCode, statusMessage, headers) {
    return {
      type: actionTypes.RESPONSE_WRITE_HEAD_DONE,
      id,
      statusCode,
      statusMessage,
      headers,
    };
  },
  responseEnd(id, chunk, encoding) { return { type: actionTypes.RESPONSE_END, id, chunk, encoding }; },
  responseEndDone(id, chunk, encoding) { return { type: actionTypes.RESPONSE_END_DONE, id, chunk, encoding }; },
  responseClose(id) { return { type: actionTypes.RESPONSE_CLOSE, id }; },
  responseFinish(id) { return { type: actionTypes.RESPONSE_FINISH, id }; },
};
