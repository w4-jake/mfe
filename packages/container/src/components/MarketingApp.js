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
  const history = useHistory();

  // Make sure that we do this just once, when the component first loads.
  useEffect(() => {
    const { onParentNavigate } = mount(ref.current, {
      initialPath: history.location.pathname,
      onNavigate: ({ pathname: nextPathname }) => {
        const { pathname } = history.location

        if (pathname !== nextPathname) {
          history.push(nextPathname)
        }
      },
    });

    history.listen(onParentNavigate);
  }, []);

  return <div ref={ref} />;
};
