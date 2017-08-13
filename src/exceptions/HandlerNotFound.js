import GdbotsPbjxException from './GdbotsPbjxException';

export default class HandlerNotFound extends GdbotsPbjxException {
  /**
   * @param {SchemaCurie} curie
   */
  constructor(curie) {
    // 12 = UNIMPLEMENTED
    // @link https://github.com/gdbots/schemas/blob/master/schemas/gdbots/pbjx/enums.xml#L22
    super(`ServiceLocator did not find a handler for curie [${curie}].`, 12);
    this.curie = curie;
  }

  /**
   * @returns {SchemaCurie}
   */
  getSchemaCurie() {
    return this.curie;
  }
}
