import URITemplate from 'urijs/src/URITemplate';
import Message from '@gdbots/pbj/Message';

/**
 * All the available uri templates keyed by an id.
 * @link http://tools.ietf.org/html/rfc6570
 */
const templates = {};

/**
 * Variables that will be merged with all expand requests.  Useful
 * for having a "site_base_url" variable that is expanded on all
 * templates that have internal urls.
 */
const globals = {};

/**
 * @param {string} id
 *
 * @return {boolean}
 */
export const hasTemplate = id => !!templates[id];

/**
 * Expand the URI template (found by id) using the supplied variables
 *
 * @param {string} id        - URI Template to expand
 * @param {Object} variables - key/values to use with the expansion
 *
 * @returns {?string} Returns the expanded template
 */
export const expand = (id, variables = {}) => {
  if (!hasTemplate(id)) {
    return null;
  }

  const template = new URITemplate(templates[id]);
  return template.expand({ ...globals, ...variables });
};

/**
 * Registers a new uri template or overrides an existing one.
 *
 * @param {string} id
 * @param {string} template
 */
export const registerTemplate = (id, template) => {
  templates[id] = template;
};

/**
 * Registers an object of id => uri template values to the service.  e.g.:
 * {'youtube:video.canonical': 'https://www.youtube.com/watch?v={youtube_video_id}'}
 *
 * @param {Object} newTemplates
 */
export const registerTemplates = (newTemplates = {}) => {
  Object.assign(templates, { ...newTemplates });
};

/**
 * Registers a global variable that will be merged with all expand requests.
 * Will override the current value if it exists.
 *
 * @param {string} name
 * @param {string|number|boolean} value
 */
export const registerGlobal = (name, value) => {
  globals[name] = value;
};

/**
 * Registers an object of global variables.  These get merged into
 * the variables array of all expand requests.
 *
 * @param {Object} newGlobals
 */
export const registerGlobals = (newGlobals = {}) => {
  Object.assign(globals, { ...newGlobals });
};

/**
 * Returns a named URL (i.e. a uri template) to a pbj instance.
 *
 * @param {Message} pbj
 * @param {string}  template
 *
 * @returns {?string}
 */
export default (pbj, template) => {
  if (!(pbj instanceof Message)) {
    return null;
  }

  return expand(`${pbj.schema().getQName()}.${template}`, pbj.getUriTemplateVars());
};
