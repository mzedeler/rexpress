const redux = require('redux');
const rexpress = require('.');
const createSagaMiddleware = require('redux-saga').default;
const sagaMiddleware = createSagaMiddleware();
const effects = require('redux-saga/effects');

const store = redux.createStore(
  require('./request/reducer'),
  redux.applyMiddleware(sagaMiddleware)
);

function* mySagas() {
  yield effects.takeEvery(
    rexpress.actionTypes.REQUEST_START,
    function*({ id }) {
      console.log(id);
      yield rexpress.actions(store).writeHead(id, 400);
      yield rexpress.actions(store).end(id, 'pong');
      console.log('pong');
    }
  );
}

sagaMiddleware.run(mySagas);
rexpress.actions(store).listen(3000);
