import React from 'react';
import ReactDOM from 'react-dom';
// react-router-dom internally makes use of this history library! So totally compatible.
import { createMemoryHistory, createBrowserHistory } from 'history'
import App from './App'

// Mount function to start up the app. Name is totally arbitrary.
const mount = (el, { defaultHistory, initialPath, onNavigate }) => {
  // When we run in isolation and use memory history, it's not the end of the world, but it's a bit
  // of a pain! Since the address bar doesn't update when we click around. So, set it up so that in
  // isolation, we get a browser history!
  // Of course, this assumes that container is NOT giving a defaultHistory...
  const history = defaultHistory || createMemoryHistory({
    initialEntries: [initialPath]
});

  // When running in isolation, there is no onNavigate being passed down! Look below...we call
  // mount without it! So we put this check in. No need to use the listener unless with container.
  if (onNavigate) {
    // Some built-in functionally. It's a listener that calls this function when history changes!
    history.listen(onNavigate);
  }

  // And we can use whatever logic we want from our framework! Like just changing el.innerHTML
  // without any framework, or if we are developing with Vue or some other library.
  ReactDOM.render(<App history={history} />, el);

  // We need to return an object here so that the caller of mount in container gets some means to
  // tell marketing when the container path has changed!
  return {
    onParentNavigate({ pathname: nextPathname }) {
      // Notice this is the exact same logic used in container/MarketingApp's onNavigate function!
      const { pathname } = history.location;

      if (pathname !== nextPathname) {
        history.push(nextPathname)
      }
    }
  };
};

// If we are in development and in isolation, call mount immediately.
// Webpack sets this variable for us in local since we set 'mode': 'development' in webpack.dev.js.
// But remember, running this code through container locally also satisfies, so below check if
// devRoot actually exists.
if (process.env.NODE_ENV === 'development') {
  // The container team should NOT have to know or worry about this ID! It's just for running in
  // isolation.
  //
  // But in fact, it is important to make sure this is some kind of unique ID so that container does
  // not accidentally recognize it. So requires at least a little bit of coordination of convention.
  //
  // Like maybe all remotes will start with "remote_isolation_dev_" or something, and that's all
  // that container team needs to know.
  const devRoot = document.querySelector('#_marketing-dev-root');

  // Thanks to above, this means we can assume we are NOT being run by container if this is true...
  if (devRoot) {
    // In a simpler app, we could just do devRoot.innerHTML = `<div>Hello.</div>`.
    // But we use the mount function above to render our react app at that div.
    mount(devRoot, { defaultHistory: createBrowserHistory() });
  }
}

// We are running through container (development or production). So we CANNOT GUARANTEE that the ID
// _marketing-dev-root exists in the HTML!
// So instead we should export the mount function. Since we don't know where or when to render it!
export { mount };
