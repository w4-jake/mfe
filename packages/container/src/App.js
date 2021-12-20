import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Redirect, Router, Route, Switch } from 'react-router-dom';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';
import { createBrowserHistory } from 'history';

import Header from './components/Header';
import Progress from './components/Progress';

const MarketingLazy = lazy(() => import('./components/MarketingApp'));
const AuthLazy = lazy(() => import('./components/AuthApp'));
const DashboardLazy = lazy(() => import('./components/DashboardApp'));

const generateClassName = createGenerateClassName({
  // Want to keep this short for production...
  productionPrefix: 'co'
})

const history = createBrowserHistory()

export default () => {
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    // Bad to use else to push to the root route, since this useEffect runs when first go to site.
    if (isSignedIn) {
      history.push('/dashboard');
    }
  }, [isSignedIn]);

  return (
    // Originally had used BrowserRouter here to create browser history, but now we just use a
    // router and pass it a new browser history from above. This essentially is the same thing, but
    // now we have access to the history object.
    <Router history={history}>
      <StylesProvider generateClassName={generateClassName}>
        <div>
          <Header isSignedIn={isSignedIn} onSignOut={() => setIsSignedIn(false)} />
          <Suspense fallback={<Progress />}>
            <Switch>
              <Route path="/auth">
                {/* // NOTE: For demo just passes callback down, but can also use Redux etc. */}
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
