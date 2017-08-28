# CHANGELOG


## v0.1.2
* Include an empty `.babelrc.js` in published package to prevent babel preset loading error.
* Add `index.js` entry point and export most commonly used classes.


## v0.1.1
* Ensure redux middleware dispatches a "response" specific fulfilled action when handling pbjx.request.
* Pass the exception to the `rejectPbjxAction` in redux middleware in both the general and curie specific actions.
* Populate the exception code with the envelope's "code" not "error_code".


## v0.1.0
* initial version
