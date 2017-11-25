const _ = require('lodash');
const redux = require('redux');
const rexpress = require('.');
const createSagaMiddleware = require('redux-saga').default;
const sagaMiddleware = createSagaMiddleware();
const effects = require('redux-saga/effects');

const reducer = (state = {}, {type, id, ...request} = {}) => {
  switch(type) {
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

function* mySagas() {
  yield effects.takeEvery(
    rexpress.actionTypes.REQUEST_START,
    function*({ id }) {
      yield rexpress.actions(store).writeHead(id, 400);
      yield rexpress.actions(store).end(id, 'pong');
    }
  );
}

sagaMiddleware.run(mySagas);
rexpress.actions(store).listen(3000);
