const _ = require('lodash');
const redux = require('redux');
const { fork, take, takeEvery, put } = require('redux-saga/effects');
const rexpress = require('.');
const createSagaMiddleware = require('redux-saga').default;
const restream = require('restream');
const fs = require('fs');
const { actions, sagas } = require('.');

const sagaMiddleware = createSagaMiddleware();

const reducer = (state = {}, { type, id, ...request } = {}) => {
  switch (type) {
    case rexpress.actionTypes.REQUEST_START:
      return _.defaults(state, { [id]: request });
    case rexpress.actionTypes.REQUEST_FINISH:
    case rexpress.actionTypes.REQUEST_CLOSE:
      return _.omit(state, id);
    default:
      return state;
  }
};

redux.createStore(
  reducer,
  redux.applyMiddleware(sagaMiddleware)
);

function* mySagas() {
  // eslint-disable-next-line no-console
  yield takeEvery('*', function* debug(action) { yield console.log(action); });
  yield fork(sagas);
  yield put(actions.serverListen(3000));
  yield takeEvery(
    rexpress.actionTypes.REQUEST_START,
    function* handler({ id, resId }) {
      const inputId = `file.${id}`;
      yield put(restream.actions.readableRegister(inputId, fs.createReadStream(__filename)));
      yield take(restream.actionTypes.READABLE_REGISTER_DONE);
      yield put(actions.responseWriteHead(id, 200));
      yield put(actions.responseWrite(id, 'Hi.\r\n\r\nThis is the demo script. My content is:\r\n\r\n---\r\n\r\n'));
      yield put(restream.actions.pipe(inputId, resId));
    }
  );
}

sagaMiddleware.run(mySagas);
