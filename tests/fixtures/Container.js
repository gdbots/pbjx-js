import LogicException from '../../src/exceptions/LogicException.js';

export default class Container {
  constructor() {
    this.parameters = {};
    this.services = {};
  }

  setParameter(name, value) {
    this.parameters[name] = value;
  }

  getParameter(name) {
    if (!this.hasParameter(name)) {
      throw new LogicException(`Parameter [${name}] not found in container.`);
    }

    return this.parameters[name];
  }

  hasParameter(name) {
    return !!(this.parameters[name] || false);
  }

  set(id, service) {
    this.services[id] = service;
  }

  get(id) {
    if (!this.has(id)) {
      throw new LogicException(`Service [${id}] not found in container.`);
    }

    return this.services[id];
  }

  has(id) {
    return this.services[id] || false;
  }
}
