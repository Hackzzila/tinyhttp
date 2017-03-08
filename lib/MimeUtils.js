'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var db = require('../types.json');
var path = require('path');

var def = null;

/**
 * Mime utilities. Accessible from {@link mime}
 */

var MimeUtils = function () {
  function MimeUtils() {
    _classCallCheck(this, MimeUtils);
  }

  _createClass(MimeUtils, null, [{
    key: 'lookup',


    /**
     * Returns a mime type for an extension or file
     * @param {String} file An extension or file
     * @returns {?String} The mime type or the default value
     */
    value: function lookup(file) {
      if (!path) return def;

      var ext = path.parse(file).ext.replace('.', '');
      if (!ext) ext = file.replace('.', '');

      var type = db.extensions[ext];
      if (!type) return def;
      return type;
    }

    /**
     * Returns a `Content-Type` string for a mime type or extension
     * @param {String} typeOrFile A mime type or file/extension
     * @returns {?String} The Content-Type` string or the default value
     */

  }, {
    key: 'contentType',
    value: function contentType(file) {
      var typeName = file;
      var type = db.types[file];
      if (!type) {
        typeName = this.lookup(file);
        type = db.types[typeName];
      }

      if (!type) {
        typeName = def;
        type = db.types[def];
      }

      if (!type) return def;
      return '' + typeName + (type.charset ? '; charset=' + type.charset : '');
    }

    /**
     * Returns the default extension for a mime type
     * @param {String} type A mime type
     * @returns {?String} The extension, the default value, or undefined for no extension
     */

  }, {
    key: 'extension',
    value: function extension(typeName) {
      var type = db.types[typeName];
      if (!type) type = db.types[def];

      if (!type) return def;

      return type.extensions ? type.extensions[0] : undefined;
    }

    /**
     * Returns the default charset for a mime type
     * @param {String} type A mime type
     * @returns {?String} The charset, the default value, or undefined for no charset
     */

  }, {
    key: 'charset',
    value: function charset(typeName) {
      var type = db.types[typeName];
      if (!type) type = db.types[def];

      if (!type) return def;

      return type.charset;
    }
  }, {
    key: 'default',

    /**
     * The default value or mime type returned when no results are found. Can be set by the user.
     * Defaults to `null`
     * @type {?*}
     */
    get: function get() {
      return def;
    },
    set: function set(val) {
      return def = val; // eslint-disable-line no-return-assign
    }
  }]);

  return MimeUtils;
}();

module.exports = MimeUtils;