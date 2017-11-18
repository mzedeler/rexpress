const redux = require('redux');
const createSagaMiddleware = require('redux-saga').default;
const effects = require('redux-saga/effects');
const sagaMiddleware = createSagaMiddleware();

const store = redux.createStore(
  require('./server/').reducer,
  redux.applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(function*() {
  yield effects.all([
    require('./server/').sagas(),
    require('./request/').sagas(),
  ])
});

const actions = require('./server').actions;

store.dispatch(actions.listen(3001));
store.dispatch(actions.listen(3001));
console.log('---');
console.log(actions.close(3001));
// setTimeout(() => store.dispatch(actions.close(3001)), 200);
