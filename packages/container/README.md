# Container application

Ultimately this application needs access to the source code of auth, dashboard, and marketing.
How does it do this?

There are generally three modes of integration: build-time (compile-time), run-time (client-side),
and server integration.  In this project, we use run-time integration.

Build-time integration would be if auth, dashboard, and marketing were published as, say, NPM
packages, and then container installs these packages as dependencies. So the output bundle includes
all source code.
* But container needs to be re-deployed every time a dependency is updated...
  since it's like upgrading an NPM package version. Annoying, defeats purpose a bit.

Run-time integration means that auth, dashboard, and marketing source code is deployed to some
static URL, and then container fetches the needed source code from the URL and runs it.
* Allows for easier independent deployability.
* Possible with Webpack Module Federation.
