# CHANGELOG


## v2.0.0
__BREAKING CHANGES__

* Async ALL THE THINGS!!
* Remove redux utils since the middleware and observable reducer wasn't as useful or necessary as we thought.
* Dispatcher now works with async listeners.


## v1.0.0
* Tag first stable version.


## v0.1.11
* In `Pbjx.copyContext` copy the `ctx_ipv6` field when present.
* In `Pbjx.request` rethrow any exceptions when response created events are triggered.


## v0.1.10
* Add `pbjUrl` which uses URI.js (http://medialize.github.io/URI.js/) to provide url resolution for pbj instances using templates.


## v0.1.9
* Adjust `PbjxToken` TTL to 10 (down from 120) and LEEWAY to 300 (from 30).  Because LEEWAY is used in both iat and exp validation we need that window to be larger, exp works within that expanded window as well.


## v0.1.8
* Adjust `PbjxToken` TTL to 120 (up from 5) and LEEWAY to 30 (from 5).


## v0.1.7
* Change `aws/lambda/getConfig.js` to accept ssm rather than create it internally.  This makes it easier
  to create unit tests for itself and for lambdas using it.  Also make it work ಠ_ಠ.
* Remove name from all default exports and prefer fat arrow functions.


## v0.1.6
* Add helpers for using pbjx in AWS Lambda.
  * `aws/lambda/determineEventSource.js` takes the event payload and returns the name of service it came from.
  * `aws/lambda/getConfig.js` takes an object with keys of parameters to load from SSM and the variables to map them to.
* Add `PbjxToken` which can be used to secure an endpoint that accept pbjx payloads.
* Add `transports/TransportEnvelope.js` for containing messages through pbjx.  Same as php lib.


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
