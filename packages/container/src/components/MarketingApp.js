import { mount } from 'marketing/MarketingApp';
import React, { useRef, useEffect } from 'react';

// Note that this technique can be used for a wide variety of technologies.
export default () => {
  const ref = useRef(null);

  useEffect(() => {
    mount(ref.current);
  });

  return <div ref={ref} />;
};
