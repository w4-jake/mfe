// This is none other than the mount function exported in 'packages/marketing/src/bootstrap.js'.
// Remember, its job is to take a reference to an HTML element (and other options) and then render
// the marketing app at that element. NOT a React component obviously.
//
// Now, we could just export a React component from the marketing package, but this is too framework
// specific! We have as an inflexible requirement that container cannot assume anything about the
// framework used by marketing. Down the road if we switched to a different framework for one, we'd
// have to switch the other app as well!
import { mount } from 'marketing/MarketingApp';
import React, { useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// Note that this technique can be used for a wide variety of technologies.
export default () => {
  // Reference to an HTML element. See how we stick it into the div below. This
  // trick of using a ref is going to be possible for most other frameworks too.
  const ref = useRef(null);
  // This grabs the browser history currently being used by the container!
  const history = useHistory();

  // Make sure that we do this just once, when the component first loads.
  useEffect(() => {
    const { onParentNavigate } = mount(ref.current, {
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

    // This useEffect should run just one time, when first rendered...so empty array.
  }, []);

  return <div ref={ref} />;
};
