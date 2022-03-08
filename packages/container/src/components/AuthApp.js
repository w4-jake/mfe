import React, { useRef, useEffect, useState } from 'react';
import { useRemoteModule } from '../hooks/useRemoteModule';
import { useHistory } from 'react-router-dom';

// Note that this technique can be used for a wide variety of technologies.
export default ({ onSignIn }) => {
  const [{ module, scope, url }, setSystem] = useState({});
  const { RemoteModule: AuthAppModule, errorLoading } = useRemoteModule(url, scope, module);
  const ref = useRef(null);
  const history = useHistory();

  useEffect(() => {
    setSystem({
      // NOTE: This is just for proof of concept. In a real build this domain can be provided by
      //       environment variable, configuration received from a server, whatever.
      url: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8082/remoteEntry.js'
        : 'https://dmj3gs11yshy9.cloudfront.net/auth/latest/remoteEntry.js',
      scope: 'auth',
      module: './AuthApp',
    });

    if (errorLoading || !AuthAppModule) {
      return
    }
    const { onParentNavigate } = AuthAppModule.mount(ref.current, {
      // In the bootstrap, if we call createMemoryHistory without arguments, it
      // begins the history at '/'. This was okay for marketing, but auth's
      // paths all start with '/auth', so it leads to a bug.
      //
      // When first navigate to signin page, there is no memory history initial
      // state saying we are there, and since there is nothing at '/' for auth
      // it just renders a blank page. Only after we click a second time does
      // it trigger a browser history change in container that gets reflected
      // in onParentNavigate being called.
      //
      // So we need to give it the current path according to browser history.
      initialPath: history.location.pathname,
      onNavigate: ({ pathname: nextPathname }) => {
        const { pathname } = history.location

        if (pathname !== nextPathname) {
          history.push(nextPathname)
        }
      },
      // It is only for AuthApp that we need to send this callback down, so only in the auth
      // bootstrap.js do we need to have this as an option for mount!
      onSignIn
    });

    history.listen(onParentNavigate);
  }, [AuthAppModule]);

  return <div ref={ref} />;
};
