const _ = require('lodash');
const redux = require('redux');
const createSagaMiddleware = require('redux-saga').default;
const effects = require('redux-saga/effects');
const sagaMiddleware = createSagaMiddleware();

const server = require('./server');
const request = require('./request');

const reducer = redux.combineReducers({
  server: server.reducer,
  request: request.reducer,
});

// const store = redux.createStore(
//   reducer,
//   redux.applyMiddleware(sagaMiddleware)
// );
const sagas = function*() {
  yield effects.all([
    server.sagas(),
    request.sagas(),
  ])
};

// sagaMiddleware.run(sagas);

// const actions = require('./server').actions;

// store.dispatch(actions.listen(3001));
// store.dispatch(actions.listen(3001));
// console.log('---');
// console.log(actions.close(3001));
// // setTimeout(() => store.dispatch(actions.close(3001)), 200);

module.exports = {
  reducer,
  sagas,
  server,
  request,
};
