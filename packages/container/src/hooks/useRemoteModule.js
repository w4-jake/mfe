import { useEffect, useState } from 'react';

async function loadModule(scope, module) {
  // Initializes the share scope. Fills with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');
  const container = window[scope]; // or get the container somewhere else
  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);
  const factory = await window[scope].get(module);
  const Module = factory();
  return Module;
}

const urlCache = new Set();

// This friend's goal is to make sure that the container HTML gets the correct script tag added
// inside the head. As the 'src' URL changes, switch it out.
const useDynamicScript = (url) => {
  const [ready, setReady] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    if (urlCache.has(url)) {
      setReady(true);
      setErrorLoading(false);
      return;
    }

    setReady(false);
    setErrorLoading(false);

    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      urlCache.add(url);
      setReady(true);
    };

    element.onerror = () => {
      setReady(false);
      setErrorLoading(true);
    };

    document.head.appendChild(element);

    return () => {
      urlCache.delete(url);
      document.head.removeChild(element);
    };
  }, [url]);

  return {
    errorLoading,
    ready,
  };
};

export const useRemoteModule = (remoteUrl, scope, module) => {
  const key = `${remoteUrl}-${scope}-${module}`;
  const [RemoteModule, setRemoteModule] = useState(null);

  const { ready, errorLoading } = useDynamicScript(remoteUrl);
  useEffect(() => {
    if (RemoteModule) setRemoteModule(null);
    // Only recalculate when key changes
  }, [key]);

  useEffect(() => {
    const loadAndSetRemoteModule = async () => {
      if (ready && !RemoteModule) {
        const Mod = await loadModule(scope, module);
        setRemoteModule(Mod);
      }
    }
    loadAndSetRemoteModule();
    // key includes all dependencies (scope/module)
  }, [RemoteModule, ready, key]);

  return { errorLoading, RemoteModule };
};
