// This is only used when running development in isolation. Otherwise, Webpack Module Federation
// does the work of getting us the bootstrap file and its dependencies asynchronously for the
// container's index.js, which also is using the non-static import() function.
import('./bootstrap')
