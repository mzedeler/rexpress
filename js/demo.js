const redux = require('redux');
const rexpress = require('.');
const createSagaMiddleware = require('redux-saga').default;
const sagaMiddleware = createSagaMiddleware();
const effects = require('redux-saga/effects');

const store = redux.createStore(
  rexpress.reducer,
  redux.applyMiddleware(sagaMiddleware)
);

function* mySagas() {
  yield effects.takeEvery(
    rexpress.request.actionTypes.REQUEST,
    function*(action) {
      const { req, res } = rexpress.driver.takeRequest(action.requestId);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('ok!');
    }
  );
}
const sagas = function*() {
  yield effects.all([
    rexpress.sagas(),
    mySagas(),
  ]);
};

sagaMiddleware.run(sagas);
store.dispatch(rexpress.server.actions.listen(3001));
