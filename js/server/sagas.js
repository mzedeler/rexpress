const actionTypes = require('./actionTypes');
const effects = require('redux-saga/effects');
const saga = require('redux-saga');
const driver = require('../driver');
const requestActions = require('../request/actions');

function* listen(action) {
  try {
    const server = yield driver.listen(action.port);
    const channel = saga.eventChannel(emitter => {
      const closeHandler = () => emitter(saga.END);
      server.on('request', emitter);
      server.on('close', closeHandler);
      return () => {
        server.removeListener('request', emitter);
        server.removeListener('close', closeHandler);
      };
    });
    yield effects.put({ type: actionTypes.ADD, port: action.port });
    while(true) {
      const request = yield effects.take(channel);
      yield effects.put(requestActions.request(request));
    }
  } catch(error) {
    console.log(error);
    effects.put({ type: actionTypes.LISTEN_FAILED, port: action.port })
  }
}

function* close(action) {
  try {
    driver.close(action.port);
    console.log('heps');
    yield effects.put({ type: actionTypes.REMOVE, port: action.port });
  } catch(error) {
    yield effects.put({ type: actionTypes.CLOSE_FAILED, port: action.port, error })
  }
}

module.exports = function*() {
  yield effects.takeEvery(actionTypes.LISTEN, listen);
  yield effects.takeEvery(actionTypes.CLOSE, close);
};
