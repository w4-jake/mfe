import React, { useContext, lazy, Suspense, useEffect, useState } from 'react';
import { Redirect, Router, Route, Switch } from 'react-router-dom';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';
import { createBrowserHistory } from 'history';

import Header from './Header';
import Progress from './Progress';

// When we first visit localhost:8080/, do we really need the resources for auth?
// Or for dashboard? No! Only when we go to signin or signup page should auth
// resources be brought in.
//
// If we just straight out imported these app files, without doing lazy, we'd
// immediately import the mount function, and that involves of course looking
// into 'auth/AuthApp' which means finding that remoteEntry.js file and loading
// up all the other resources! Even when just going to localhost:8080/
//
// So, lazily load the code only when React realizes that these files are
// necessary. After using this, see that nothing from localhost:8082 is actually
// requested by the browser until go to the Login page!
//
// Try running with throttling set to 'Slow 3G', to see loading in real time.
const AuthLazy = lazy(() => import('./AuthApp'));
const DashboardLazy = lazy(() => import('./DashboardApp'));
const MarketingLazy = lazy(() => import('./MarketingApp'));

const generateClassName = createGenerateClassName({
  // Want to keep this short for production...
  productionPrefix: 'co'
})

const history = createBrowserHistory()

const Main = () => {
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    // Bad to use else to push to the root route, since this useEffect runs when first go to site.
    // If user first goes to '/pricing' or something, we don't want them redirected then to '/'.
    if (isSignedIn) {
      history.push('/dashboard');
    }
  }, [isSignedIn]);

  return (
    // Some notes about routing...
    //
    // A routing library in general maintains two things:
    //   - History to determine what path the user is currently on, and also change the path!
    //   - Router to figure out what content to show based on path.
    //
    // And there are generally three types of history:
    //   - Browser history (most popular): just look at the address bar, what's after domain.
    //   - Hash history: uses the '#' character...look it up if curious.
    //   - Memory/Abstract history: stores the information inside an object in code. So, it does not
    //     look at the address bar.
    //
    // Whenever you create a React-Router instance, you need to tell it what kind of history to use.
    // A very common way for mfe development is browser history in container, then memory history in
    // child apps. Keeping only one browser history object makes sense to prevent multiple apps from
    // trying to change the address bar path at the same time (race condition). Just container will
    // look at and touch the address bar.
    //
    // Originally had used BrowserRouter here. Behind the scenes, it also creates a browser history
    // object.
    //
    // Some issues where there is no routing communication between container and marketing...
    // Say we run container and marketing locally and then go to localhost:8084/. What happens?
    //   1. First, a browser history for container and then a memory history for marketing is made.
    //      Initial path is '/' for container because of address bar, and '/' for marketing because
    //      memory history by default starts with '/'.
    //   2. Then, click on link to '/pricing'. This changes marketing's memory history, and we see
    //      the right content on screen where the MarketingApp is rendered. But unless we do some
    //      other thing, it doesn't update container browser history, so address bar stays at '/'!
    // Say we run container and marketing locally and then go to localhost:8084/pricing.
    //   1. First, a browser history for container and then a memory history for marketing is made.
    //      Initial path is '/pricing' for container because of address bar, and '/' for marketing
    //      because memory history by default starts with '/'. So the non-pricing default page for
    //      marketing is rendered in the MarketingApp!
    //   2. Then, click on link to '/pricing'. This changes marketing's memory history, and we see
    //      the right content on screen where the MarketingApp is rendered, and address bar matches.
    //      But of course if we navigate away to '/' through 'App' button in container, it doesn't
    //      affect marketing's memory history, so the pricing page still shows...
    //
    // REMEMBER, when you click links, they will affect the closest parent router's history only. So
    // in container if there is an <a href="/" /> and you click it, it will change browser history.
    // Whereas if that link were rendered by marketing, it would affect marketing's memory history.
    //
    // So need two ways to communicate (as generically as possible! Don't just share react history):
    //   - When click link in container, send a change down to marketing so marketing will update
    //     memory history. (This means we need receive a handler of some kind...see MarketingApp.js)
    //   - When click link in marketing, send a change up to container so container will update
    //     browser history. (So pass 'onNavigate' callback down! See mount in MarketingApp.js.)
    //
    // Now, we just use a Router and pass it a new browser history from above. This essentially is
    // the same thing, but now we have access to the history object in order to write the useEffect.
    // (Remember, in child components we can import useHistory, but in this top-level component
    // that apparently does not work.)
    <Router history={history}>
      <StylesProvider generateClassName={generateClassName}>
        <div>
          <Header isSignedIn={isSignedIn} onSignOut={() => setIsSignedIn(false)} />
          {/* Anything inside here that is lazy will have this fallback shown while not ready. */}
          <Suspense fallback={<Progress />}>
            <Switch>
              <Route path="/auth">
                {/* // NOTE: For demo just passes callback down, but can also use Redux etc. to keep
                track of a lot more states and setters at the container level. */}
                <AuthLazy onSignIn={() => setIsSignedIn(true)} />
              </Route>
              <Route path="/dashboard" >
                {!isSignedIn && <Redirect to="/" />}
                <DashboardLazy />
              </Route>
              <Route path="/" component={MarketingLazy} />
            </Switch>
          </Suspense>
        </div>
      </StylesProvider>
    </Router>
  );
};

export default Main;
