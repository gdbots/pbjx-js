# CHANGELOG


## v0.1.5
* Remove the `babel` key from the `package.json` during build so projects importing 
  this lib don't have their babel config wiped out during serve/build/bundle/etc.


## v0.1.4
* Update npm `peerDependencies` to allow for more versions of `@gdbots/pbj`.


## v0.1.3
* In `redux/createMiddleware.js`:
  * Add the ability to include a "channel" in a redux action. This addresses issues with 
    concurrent pbjx actions or simply needing pbjx actions to be reduced into different 
    parts of the state in a reducer.
  * Change the redux action structure to `action.ctx` instead of `action.pbjx` for clarify 
    that it's contextual data about the action which may or may not be pbjx specific.
  * Return a promise with the result of the final dispatch in the pbjx process.
* Add `redux/actions.js` with one public action creator `callPbjx`.
* Change `redux/createReducer.js` to call the reducer with the standard signature of
  `prevState, action` instead of `prevState, pbj`.  This also gives the reducer the complete
  action containing the new `action.ctx` property which has the channel and other useful data.  


## v0.1.2
* Include an empty `.babelrc.js` in published package to prevent babel preset loading error.
* Add `index.js` entry point and export most commonly used classes.


## v0.1.1
* Ensure redux middleware dispatches a "response" specific fulfilled action when handling pbjx.request.
* Pass the exception to the `rejectPbjxAction` in redux middleware in both the general and curie specific actions.
* Populate the exception code with the envelope's "code" not "error_code".


## v0.1.0
* initial version
