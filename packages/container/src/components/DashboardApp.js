import { mount } from 'dashboard/DashboardApp';
import React, { useRef, useEffect } from 'react';

// Very bare bones compared to auth and marketing
export default () => {
  const ref = useRef(null);

  useEffect(() => {
    mount(ref.current)
  }, []);

  return <div ref={ref} />;
};
