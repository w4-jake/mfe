# Microfrontends with React: A Complete Developer's Guide

Generalized comments on webpack and so on are mostly in the marketing and container directory.
Also see the container README.md for an overview of build-time integration vs. run-time integration
and how this project is the second type.

## What are the requirements that drove the architecture choices for this project?

REMEMBER, this is for THIS project. Other projects that use Microfrontends can have different needs.

### Inflexible

* ZERO coupling between child apps
  * This means no shared state, no reducers, importing of functions/classes from each other.
  * Shared libraries through Module Federation is ok.
  * WHY? If later child projects want to change from React to Vue, or really anything, can't break.
    * "But sharing some React components is ok right?"
    * Eventually React will be old and forgotten. It would stink if in 5-10 years you have to deal
      with it because a different app depended on it, and there is a dependency, and you don't even
      know how to debug React.
* NEAR-ZERO coupling between container and child apps
  * Some communication allowed, but only with very simple JS callbacks and events (not Redux etc.).
  * But container cannot assume that a child is using a particular framework.
  * WHY? Well, it's inevitable. Container has to hear back from Auth when login has worked so it can
    know to show "Logout" ono the button instead of the default "Login".
* CSS from one app should never affect another.
  * WHY? If you change in one don't want it to break another.
* Version control (monorepo vs separate) shouldn't have any impact on the project.
  * WHY? Some people prefer monorepos, others like separate, but it shouldn't matter.
* Container should be able to use either *latest* version of a child app or a specific version.
  * WHY? So that a company if it wants can say, let's just pin version X of it, and then hold off on
    the update to latest only at a time we want for later.

## Why didn't we use Create-React-App to make the subprojects?

When the lecture was created, create-react-app didn't work with a version of Webpack that supported
the Module Federation Plugin. This may have changed by now...

## What are the requirements regarding how deployment should work?

* Each app needs to be independently deployable.
  * Teams might be working/updating at different paces so it's important to have that flexibility.
* Location of child app remoteEntry.js files must be known at *build time*!
  * Remember that when we run container, we are going to load up a main.js into the browser. This
    file is created through the webpack build process -- it's not in the code editor. Then when app
    decides it needs marketing app info, it needs to find the remoteEntry.js file. So main.js MUST
    know exactly what URL to go to get the file, which means it has to be known at build time when
    main.js is created.
  * As an example, when running container and marketing in development and then open up main.js file
    from the Chrome tools, notice that it's hard-coded to load what it was built to load:
    * __webpack_require__.l("http://localhost:8081/remoteEntry.js", (event) => ... )
  * So in the webpack production file, we need to think hard to make sure that the location of the
    file is known at build time and exact.
* The front-end deployment tool we use must be one that doesn't assume a single project is deployed.
  * Must be able to handle multiple different projects.
* Probably need a CI/CD pipeline of some sort.
* At the time of the course, the remoteEntry.js file name is fixed for the Module Federation Plugin!
  * So need to think about caching issues related to that...unless this requirement no longer holds.

## How is this deployed?

* One git monorepo that is pushed to Github.
* Uses Github actions to build production versions of projects within monorepo that changed, and
  then upload the files to Amazon S3. (main.js and index.html for Amazon S3, main.js, remoteEntry.js
  and dependencies from other projects.)
* Browser will ask for the files from Amazon CloudFront (CDN), which will provide first index.html
  for container and then from the script tag there pull up container main.js, and begin that whole
  process, like getting the remoteEntry.js file.
