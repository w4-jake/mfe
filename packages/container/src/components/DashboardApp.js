import { useRemoteModule } from '../hooks/useRemoteModule';
import React, { useRef, useEffect, useState } from 'react';

// Very bare bones compared to auth and marketing
export default () => {
  const [{ module, scope, url }, setSystem] = useState({});
  const { RemoteModule: DashboardAppModule, errorLoading } = useRemoteModule(url, scope, module);
  const ref = useRef(null);

  useEffect(() => {
    setSystem({
      // NOTE: This is just for proof of concept. In a real build this domain can be provided by
      //       environment variable, configuration received from a server, whatever.
      url: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8083/remoteEntry.js'
        : 'https://dmj3gs11yshy9.cloudfront.net/dashboard/latest/remoteEntry.js',
      scope: 'dashboard',
      module: './DashboardApp',
    });

    if (errorLoading || !DashboardAppModule) {
      return
    }
    DashboardAppModule.mount(ref.current)
  }, [DashboardAppModule]);

  return <div ref={ref} />;
};
