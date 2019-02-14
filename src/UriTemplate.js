import URITemplate from 'urijs/src/URITemplate';

import Message from '@gdbots/pbj/Message';

let templates = {};
let globals = {};

/**
 * Determines if a given template id has an associated template
 * @param string id
 * @return boolean
 */
const hasTemplates = id => !!templates[id];

const expand = (id, uriTemplateVars = {}) => {
  if(!hasTemplates(id)) {
    return false;
  }
  return new URITemplate(templates[id]).expand({...globals, ...uriTemplateVars});
};

export const registerTemplates = (newTemplates = {}) => templates = {...templates, ...newTemplates};

export const registerGlobals = (newGlobals = {}) => globals = {...globals, ...newGlobals};

/**
 * Creates the expanded url given the node and the template.
 * @param {Message} node instance of class Message
 * @param {string} template
 */
export const pbjUrl = (node, template = '') => {
  if (!(node instanceof Message)) {
    throw new Error('Node should be an instance of Message.')
  }
  return expand(`${node.schema().getQName()}.${template}`, {...node.getUriTemplateVars()});
};

/**
 * Creates the expanded url given the template id and variables
 * @param {string} id
 * @param {object} templateVars
 */
export const uriTemplateExpand = (id, templateVars = {}) => expand(id, {...templateVars});
