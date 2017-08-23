import LogicException from '../../src/exceptions/LogicException';

export default class Container {
  constructor() {
    this.services = {};
  }

  set(id, service) {
    this.services[id] = service;
  }

  get(id) {
    if (!this.has(id)) {
      throw new LogicException(`Entry [${id}] not found in container.`);
    }

    return this.services[id];
  }

  has(id) {
    return this.services[id] || false;
  }
}
