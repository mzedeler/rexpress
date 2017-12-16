const _ = require('lodash');
const redux = require('redux');
const rexpress = require('.');
const createSagaMiddleware = require('redux-saga').default;
const replug = require('replug');
const fs = require('fs');

const sagaMiddleware = createSagaMiddleware();
const effects = require('redux-saga/effects');

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

const store = redux.createStore(
  reducer,
  redux.applyMiddleware(sagaMiddleware)
);

const bindActions = (dispatch, getState, actions) => _
  .cloneDeepWith(actions, (value) => { // eslint-disable-line consistent-return
    if (typeof value === 'function') {
      return (...args) => _.spread(value)(args)(dispatch, getState);
    }
  });

const actions = bindActions(store.dispatch, store.getState, rexpress.actions);

const replugActions = bindActions(store.dispatch, store.getState, replug.actions);

function* mySagas() {
  yield effects.takeEvery(
    rexpress.actionTypes.REQUEST_START,
    function* handler({ id, resId }) {
      const inputId = `file.${id}`;
      yield replugActions.restream.readable(inputId, fs.createReadStream(__filename));
      yield actions.writeHead(id, 200);
      yield actions.write(id, 'Hi.\r\n\r\nThis is the demo script. My content is:\r\n\r\n---\r\n\r\n');
      yield replugActions.restream.pipe(inputId, resId);
    }
  );
}

sagaMiddleware.run(mySagas);
actions.listen(3000);
