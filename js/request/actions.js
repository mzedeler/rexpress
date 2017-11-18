const actionTypes = require('./actionTypes');

module.exports = {
  request: (request) => ({
    type: actionTypes.REQUEST,
    request,
  }),
  handle: (handler) => ({
    type: actionTypes.HANDLE,
    handler,
  }),
};
