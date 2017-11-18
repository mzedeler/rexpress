const actionTypes = require('./actionTypes');

module.exports = {
  listen: (port) => ({
    type: actionTypes.LISTEN,
    port,
  }),
  close: (port) => ({
    type: actionTypes.CLOSE,
    port
  }),
};
