const _ = require('lodash');
const actionTypes = require('./actionTypes');

const initialState = {};

module.exports = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.ADD:
      return _.defaults(state, { [action.port]: {} });
    case actionTypes.REMOVE:
      return _.omit(state, action.port);
    default:
      return state;
  }
};
