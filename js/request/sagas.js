const actionTypes = require('./actionTypes');
const effects = require('redux-saga/effects');
const driver = require('../driver');

function* request(action) {
  console.log('request action');
  console.log(action);
}

module.exports = function*() {
  yield effects.takeEvery(actionTypes.REQUEST, request);
};
