// This is none other than the mount function exported in 'packages/marketing/src/bootstrap.js'.
// Remember, its job is to take a reference to an HTML element (and other options) and then render
// the marketing app at that element. NOT a React component obviously.
//
// Now, we could just export a React component from the marketing package, but this is too framework
// specific! We have as an inflexible requirement that container cannot assume anything about the
// framework used by marketing. Down the road if we switched to a different framework for one, we'd
// have to switch the other app as well!
import React, { useContext, useState, useEffect } from 'react';

import { EnvContext } from '../App';
import useFederatedComponent from '../hooks/useFederatedComponent';

// Note that this technique can be used for a wide variety of technologies.
export default () => {
  const env = useContext(EnvContext);
  const [{ module, scope, url }, setSystem] = useState({});
  const { Component: FederatedComponent, errorLoading } = useFederatedComponent(url, scope, module);

  // Make sure that we do this just once, when the component first loads.
  useEffect(() => {
    setSystem({
      url: `${env.MARKETING_API_URL}/remoteEntry.js`,
      scope: 'marketing',
      module: './MarketingApp',
    })
  }, []);

  return (
    <React.Suspense fallback="Loading System">
      {errorLoading
        ? `Error loading module "${module}"`
        : FederatedComponent && <FederatedComponent />}
    </React.Suspense>
  );
};
