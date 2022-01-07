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
