// This microapp does not need any routing or history! Since it's just a page.
import { createApp } from 'vue';
import Dashboard from './components/Dashboard.vue'

// Mount function to start up the app. No incoming options this time.
const mount = (el) => {
  // Next two lines are specific to Vue...this is how you start things.
  const app = createApp(Dashboard);
  app.mount(el);
};

// If we are in development and in isolation,
// call mount immediately
if (process.env.NODE_ENV === 'development') {
  const devRoot = document.querySelector('#_dashboard-dev-root');

  if (devRoot) {
    mount(devRoot);
  }
}

// We are running through container
// and we should export the mount function
export { mount };
