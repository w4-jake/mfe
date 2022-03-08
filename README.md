# Microfrontends with React: A Complete Developer's Guide

Generalized comments on webpack, styling, routing, and so on are mostly in the marketing and
container directory.

Auth has some discussion about publicPath for dev development at webpack.dev.js, and about initial
history at container's AuthApp.js. These discussions came up at this point in the lecture because
the auth route prefix of '/auth' doesn't start at the root '/'.

Also see the container README.md for an overview of build-time integration vs. run-time integration
and how this project is the second type.

## How do you run this?

### Local
- `npm install` and `npm start` in each of the four package directories.
- Then visit `localhost:8084`.

### Production:

It's already running (maybe) at `https://dmj3gs11yshy9.cloudfront.net/`.

## What are the requirements that drove the architecture choices for this project?

REMEMBER, this is for THIS project. Other projects that use Microfrontends can have different needs.
**Your requirements drive your architecture.**

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

* One git monorepo that is pushed to Github to master branch.
  * (This also allows us to to push to other branches and introduce a review process before PR.)
* Uses Github actions to build production versions of projects within monorepo that changed, and
  then upload the files to Amazon S3. (main.js and index.html for Amazon S3, main.js, remoteEntry.js
  and dependencies from other projects.)
* Browser will ask for the files from Amazon CloudFront (CDN), which will provide first index.html
  for container and then from the script tag there pull up container main.js, and begin that whole
  process, like getting the remoteEntry.js file.

## What are the requirements for how routing should work for this container?

* Both container and child apps need to be able to support routing features.
  * Container routing governs navigation to different child apps.
  * Child app routing governs navigation within the child app once we've entered from container.
  * Not all child apps need routing. (Ex. dashboard)
  * In this project, container, marketing, and auth all have React-Router.
    *  But! They don't assume others also have React-Router as their routing library.
* Child apps might need to add in new pages/routes all the time.
  * ...and this shouldn't mean that a container redeploy is necessary.
* Might need to show two or more microfrontends on the screen at the same time.
  * Like a sidebar that's always on, and then a content section.
* Should be able to use off-the-shelf routing solutions like React-Router.
  * Some amount of custom coding is OK...but shouldn't have to reinvent the wheel.
* Routing should be supported in both isolation and together.
* If different apps need to communicate info, should be done as generically as possible.
  * Might swap up nav libraries all the time so shouldn't require a rewrite of app.

## How does authentication work here?

* The dashboard page should be guarded. Only when the user has logged in can this page be accessed.
* The auth app itself is not for enforcing permissions, allowing access to certain routes.
  * Why? With lazy loading, auth app might not actually be loaded when user tries to access a route
    to dashboard, like app.com/dashboard. In this app, only container and dashboard resources are
    requested by the browser if go directly to that page!
* It's possible to have each app being aware of whether the user is authorized...but cleaner to
  centralize this information (as an "isSignedIn" value) in the container.

## Big takeaways?

* Your requirements drive your architecture. See above.
* Always ask..."If I have to change this thing in the future, will I hve to change another app?"
* Everyone will eventually forget React/Vue/some specific tool, so try to use as generic shepherds
  of information as possible.
* Scope your CSS with a css-in-js library or some other means. See marketing/src/App.js
* Be prepared for issues in production that you don't see in development...study this repo, and do
  careful QA in your own microfrontend projects!
