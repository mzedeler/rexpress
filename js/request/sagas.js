const actionTypes = require('./actionTypes');
const effects = require('redux-saga/effects');
const driver = require('../driver');

function* request(action) {
  const { req, res } = driver.takeRequest(action.requestId);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('ok');
}

module.exports = function*() {
  yield effects.takeEvery(actionTypes.REQUEST, request);
};
