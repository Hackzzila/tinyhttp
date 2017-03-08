const db = require('../types.json');
const path = require('path');

let def = null;

/**
 * Mime utilities. Accessible from {@link mime}
 */
class MimeUtils {
  /**
   * The default value or mime type returned when no results are found. Can be set by the user.
   * Defaults to `null`
   * @type {?*}
   */
  static get default() {
    return def;
  }

  static set default(val) {
    return def = val; // eslint-disable-line no-return-assign
  }

  /**
   * Returns a mime type for an extension or file
   * @param {String} file An extension or file
   * @returns {?String} The mime type or the default value
   */
  static lookup(file) {
    if (!path) return def;

    let ext = path.parse(file).ext.replace('.', '');
    if (!ext) ext = file.replace('.', '');

    const type = db.extensions[ext];
    if (!type) return def;
    return type;
  }

  /**
   * Returns a `Content-Type` string for a mime type or extension
   * @param {String} typeOrFile A mime type or file/extension
   * @returns {?String} The Content-Type` string or the default value
   */
  static contentType(file) {
    let typeName = file;
    let type = db.types[file];
    if (!type) {
      typeName = this.lookup(file);
      type = db.types[typeName];
    }

    if (!type) {
      typeName = def;
      type = db.types[def];
    }

    if (!type) return def;
    return `${typeName}${type.charset ? `; charset=${type.charset}` : ''}`;
  }

  /**
   * Returns the default extension for a mime type
   * @param {String} type A mime type
   * @returns {?String} The extension, the default value, or undefined for no extension
   */
  static extension(typeName) {
    let type = db.types[typeName];
    if (!type) type = db.types[def];

    if (!type) return def;

    return type.extensions ? type.extensions[0] : undefined;
  }

  /**
   * Returns the default charset for a mime type
   * @param {String} type A mime type
   * @returns {?String} The charset, the default value, or undefined for no charset
   */
  static charset(typeName) {
    let type = db.types[typeName];
    if (!type) type = db.types[def];

    if (!type) return def;

    return type.charset;
  }
}

module.exports = MimeUtils;
