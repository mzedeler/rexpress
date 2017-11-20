const _ = require('lodash');
const actionTypes = require('./actionTypes');

const initialState = {};

module.exports = (state = initialState, {type, requestId, ...request} = {}) => {
  switch(type) {
    case actionTypes.REQUEST:
      return _.defaults(state, { [requestId]: request });
    case actionTypes.REMOVE:
      return _.omit(state, requestId);
    default:
      return state;
  }
};
