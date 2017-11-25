describe('Module API', () => {
  test('it is possible to require the module', () => {
    const load = () => require('.');

    expect(load).not.toThrow();
    expect(Object.keys(load())).toEqual(['actions', 'actionTypes']);
  });
});
