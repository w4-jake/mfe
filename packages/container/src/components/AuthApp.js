import { mount } from 'auth/AuthApp';
import React, { useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// Note that this technique can be used for a wide variety of technologies.
export default ({ onSignIn }) => {
  const ref = useRef(null);
  const history = useHistory();

  useEffect(() => {
    const { onParentNavigate } = mount(ref.current, {
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
      onSignIn
    });

    history.listen(onParentNavigate);
  }, []);

  return <div ref={ref} />;
};
