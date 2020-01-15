const isEqual = require('lodash.isequal');

function setState(store, newState, afterUpdateCallback) {
  store.state = { ...store.state, ...newState };
  store.listeners.forEach((listener) => {
    listener.run(store.state);
  });
  afterUpdateCallback && afterUpdateCallback(store.state, newState);
}

function getState(store, selector) {
  return selector ? selector(store.state) : store.state;
}

function useCustom(store, React, mapState, mapActions) {
  const [, originalHook] = React.useState(Object.create(null));
  const state = getState(store, mapState);
  const actions = React.useMemo(
    () => (mapActions ? mapActions(store.actions) : store.actions),
    [mapActions, store.actions]
  );

  React.useEffect(() => {
    const newListener = { oldState: {} };
    newListener.run = mapState
      ? newState => {
          const mappedState = getState(store, mapState);
          if (!isEqual(mappedState, newListener.oldState)) {
            newListener.oldState = mappedState;
            originalHook(mappedState);
          }
        }
      : originalHook;
    store.listeners.push(newListener);
    newListener.run(store.state);
    return () => {
      store.listeners = store.listeners.filter(
        listener => listener !== newListener
      );
    };
  }, []); // eslint-disable-line
  return [state, actions];
}

function associateActions(store, actions) {
  const associatedActions = {};
  Object.keys(actions).forEach(key => {
    if (typeof actions[key] === "function") {
      associatedActions[key] = actions[key].bind(null, store);
    }
    if (typeof actions[key] === "object") {
      associatedActions[key] = associateActions(store, actions[key]);
    }
  });
  return associatedActions;
}

function useStore (React, initialState = {}, actions = {}, initializer = null) {
  const store = { state: initialState, listeners: [] };
  store.setState = setState.bind(null, store);
  store.getState = getState.bind(null, store);
  store.actions = associateActions(store, actions);
  if (initializer) {
    initializer(store);
  }
  const hook = useCustom.bind(null, store, React);
  hook.setState = store.setState;
  hook.getState = store.getState;
  hook.actions = store.actions;
  return hook;
};

module.exports = useStore;
