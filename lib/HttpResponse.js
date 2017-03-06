'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var url = require('url');
var zlib = require('zlib');
var querystring = require('querystring');

/**
 * A response
 */

var HttpResponse = function () {
  function HttpResponse(req, res) {
    _classCallCheck(this, HttpResponse);

    /**
     * The request that got this response
     * @type {HttpResponse}
     */
    this.req = req;

    /**
     * The status code
     * @type {Number}
     */
    this.statusCode = res.statusCode;

    /**
     * The status message
     * @type {String}
     */
    this.statusMessage = res.statusMessage;

    /**
     * Headers
     * @type {Object}
     */
    this.headers = res.headers;

    /**
     * Response data in a Buffer, always present
     * @type {Buffer}
     */
    this.buffer = Buffer.alloc(0);

    /**
     * Reponse data as a String, present when Content-Type is text or when `body` is present
     * @type {?String}
     */
    this.text = null;

    /**
     * Parsed response data if available, otherwise null, most likely an object
     * @type {?*}
     */
    this.body = null;
  }

  _createClass(HttpResponse, [{
    key: 'getData',
    value: function getData(req, res) {
      var _this = this;

      return new Promise(function (resolve) {
        var stream = void 0;
        if (_this.headers['content-encoding'] === 'gzip') {
          stream = res.pipe(zlib.createGunzip());
        } else if (_this.headers['content-encoding'] === 'deflate') {
          stream = res.pipe(zlib.createInflate());
        } else stream = res;

        stream.on('data', function (chunk) {
          _this.buffer = Buffer.concat([_this.buffer, chunk]);
        });

        stream.on('end', function () {
          _this.text = _this.buffer.toString();

          if (_this.headers['content-type'] === 'application/json') _this.body = JSON.parse(_this.buffer);else if (_this.headers['content-type'] === 'application/x-www-form-urlencoded') _this.body = querystring.parse(_this.buffer);

          resolve(_this);
        });
      });
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.statusCode + ' ' + this.statusMessage + ' ' + url.format(this.req.url);
    }
  }]);

  return HttpResponse;
}();

module.exports = HttpResponse;