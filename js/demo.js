const redux = require('redux');
const rexpress = require('.');
const createSagaMiddleware = require('redux-saga').default;
const sagaMiddleware = createSagaMiddleware();

const store = redux.createStore(
  rexpress.reducer,
  redux.applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rexpress.sagas);
store.dispatch(rexpress.server.actions.listen(3001));
