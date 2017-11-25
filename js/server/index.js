module.exports = (store) => ({
  actionTypes: require('./actionTypes'),
  actions: require('./actions')(store),
});
