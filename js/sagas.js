const _ = require('lodash');
const { buffers, eventChannel, END } = require('redux-saga');
const { cps, fork, spawn, put, take, takeEvery } = require('redux-saga/effects');
const http = require('http');
const actions = require('./actions');
const actionTypes = require('./actionTypes');
const { readableRegister, writableRegister } = require('restream').actions;
const restream = require('restream');

const servers = {};
const requests = {};
let currentRequest = 0;

function* serveRequestSaga([req, res]) {
  currentRequest += 1;
  const id = currentRequest;
  requests[id] = { req, res };
  const reqId = `req.${id}`;
  const resId = `res.${id}`;
  yield put(readableRegister(reqId, req));
  yield put(writableRegister(resId, res));

  const channel = eventChannel(
    (emitter) => {
      const done = action => () => {
        emitter(action);
        // TODO: test which actions pass through if leaving this out:
        delete requests[id];
        emitter(END);
      };
      res.on('close', done(actions.responseClose(id)));
      res.on('finish', done(actions.responseFinish(id)));
      res.on('end', done(actions.responseEventEnd(id)));

      req.on('abort', done(actions.requestAbort(id)));
      req.on('close', done(actions.requestClose(id)));

      return _.noop; // TODO: cleanup: abort response
    },
    buffers.expanding(1)
  );

  yield takeEvery(channel, put);

  const { method, url, headers, rawHeaders, httpVersion } = req;
  yield put(actions.requestStart(id, reqId, resId, httpVersion, method, url, headers, rawHeaders));
}

function* serverListenSaga(port) {
  const channel = eventChannel(
    (emitter) => {
      // TODO: Handle failure to listen
      const server = http.createServer(_.rest(emitter));
      emitter(server);
      return _.noop; // TODO: Server cleanup: close and remove from servers
    },
    buffers.expanding(1)
  );

  const server = yield take(channel);

  try {
    yield cps([server, server.listen], port);
    servers[port] = { server, channel };
    yield takeEvery(channel, serveRequestSaga);
    put(actions.serverListenDone(port));
  } catch (error) {
    put(actions.serverListenError(port, error));
  }
}

function* serverCloseSaga(port) {
  servers[port].http.close();
  delete servers[port];
  yield put(actions.serverCloseDone(port));
}

function* responseWriteSaga({ id, chunk, encoding }) {
  const { res } = requests[id];
  if (res) {
    res.write(chunk, encoding);
    yield put(actions.responseWriteDone(id, chunk, encoding));
  }
}

function* responseWriteHeadSaga({ id, statusCode, statusMessage, headers }) {
  const { res } = requests[id];
  if (res) {
    _.each(headers, (value, name) => res.setHeader(name, value));

    res.writeHead(statusCode, statusMessage, headers);
    yield put(actions.responseWriteHeadDone(id, statusCode, statusMessage, headers));
  } // else error handling
}

function* responseEndSaga({ id, chunk, encoding }) {
  const { res } = requests[id];
  if (res) {
    res.end(chunk, encoding);
    yield put(actions.responseEndDone(id, chunk, encoding));
  } // else error handling
}

let running = false;
function* rootSaga() {
  if (running) {
    // eslint-disable-next-line no-console
    console.error('rexpress already running. This will lead to unpredictable results.');
  }
  running = true;
  yield spawn(function* listeners() {
    yield fork(restream.sagas);
    yield takeEvery(actionTypes.SERVER_LISTEN, serverListenSaga);
    yield takeEvery(actionTypes.SERVER_CLOSE, serverCloseSaga);
    yield takeEvery(actionTypes.RESPONSE_WRITE, responseWriteSaga);
    yield takeEvery(actionTypes.RESPONSE_WRITE_HEAD, responseWriteHeadSaga);
    yield takeEvery(actionTypes.RESPONSE_END, responseEndSaga);
  });
}

module.exports = rootSaga;
