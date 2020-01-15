const useGlobalHook = require('./index.js');
const assert = require('assert');
const React = require('react');

describe('useGlobalHook', () => {
  let increment = (store) => store.setState({count: store.state.count + 1});

  it('should export a function which returns a Hook state manager', () => {
    let hook = useGlobalHook(React, {count: 1});

    assert.ok(hook);
    assert.equal(typeof hook, 'function');
  });

  it('should export getState, setState, and actions on the Hook', () => {
    let hook = useGlobalHook(React, {count: 1}, {increment});

    assert.equal(hook.getState((state) => state.count), 1);

    // test it reacts to an action
    hook.actions.increment();
    assert.equal(hook.getState((state) => state.count), 2);

    // test it reacts to setState
    hook.setState({count: 42});
    assert.equal(hook.getState((state) => state.count), 42);
  });
});