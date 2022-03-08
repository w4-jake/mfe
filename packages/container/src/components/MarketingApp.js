// This is none other than the mount function exported in 'packages/marketing/src/bootstrap.js'.
// Remember, its job is to take a reference to an HTML element (and other options) and then render
// the marketing app at that element. NOT a React component obviously.
//
// Now, we could just export a React component from the marketing package, but this is too framework
// specific! We have as an inflexible requirement that container cannot assume anything about the
// framework used by marketing. Down the road if we switched to a different framework for one, we'd
// have to switch the other app as well!
import React, { useRef, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useRemoteModule } from '../hooks/useRemoteModule';

// Note that this technique can be used for a wide variety of technologies.
export default () => {
  const [{ module, scope, url }, setSystem] = useState({});
  const { RemoteModule: MarketingAppModule, errorLoading } = useRemoteModule(url, scope, module);
  // Reference to an HTML element. See how we stick it into the div below. This
  // trick of using a ref is going to be possible for most other frameworks too.
  const ref = useRef(null);
  // This grabs the browser history currently being used by the container!
  const history = useHistory();

  // Make sure that we do this just once, when the component first loads.
  useEffect(() => {
    setSystem({
      // NOTE: This is just for proof of concept. In a real build this domain can be provided by
      //       environment variable, configuration received from a server, whatever.
      url: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8081/remoteEntry.js'
        // NOTE: the 'https://' prefix is required here! Without it, remoteEntry.js not found.
        : 'https://dmj3gs11yshy9.cloudfront.net/marketing/latest/remoteEntry.js',
      scope: 'marketing',
      module: './MarketingApp',
    });

    if (errorLoading || !MarketingAppModule) {
      return
    }
    const { onParentNavigate } = MarketingAppModule.mount(ref.current, {
      // See why needed at AuthApp.js.
      initialPath: history.location.pathname,
      // The history.listen function gives us a location object as a parameter to work with!
      onNavigate: ({ pathname: nextPathname }) => {
        // Current path inside container app (as in by browser history).
        const { pathname } = history.location

        // Prevent an infinite loop...since we're going to have marketing and container.
        // communicating with each other, want to prevent them updating over and over the same path.
        if (pathname !== nextPathname) {
          // So changes browser history, which means also changes address bar.
          history.push(nextPathname)
        }
      },
    });

    // Set up the same kind of listener as in marketing bootstrap.js. But this one is for
    // container's browser history.
    history.listen(onParentNavigate);

  }, [MarketingAppModule]);

  return <div ref={ref} />;
};
