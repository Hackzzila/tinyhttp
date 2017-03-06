'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var url = require('url');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var HttpResponse = require('./HttpResponse');

/**
 * A HTTP request, returned by all request methods.
 */

var HttpRequest = function () {
  /**
   * Make a new HttpRequest
   * @param {String} method The HTTP method
   * @param {String|Object} url The URL, can be a String or a [URL Object]{@link https://nodejs.org/dist/latest-v7.x/docs/api/url.html#url_url_strings_and_url_objects}
   */
  function HttpRequest(method, u) {
    _classCallCheck(this, HttpRequest);

    /**
     * The HTTP method
     * @type {String}
     */
    this.method = method;

    /**
     * The headers to be sent, can be manipulated easily with {@link HttpRequest#set}
     * @type {Object}
     */
    this.headers = { 'User-Agent': 'node-tinyhttp', 'Accept-Encoding': 'gzip, deflate' };

    /**
     * The request body, can be manipulated easily with {@link HttpRequest#send}
     * @type {Buffer|String}
     */
    this.body = null;

    /**
     * The request body encoding, if used, can be manipulated easily with {@link HttpRequest#send}
     * @type {String}
     */
    this.encoding = null;

    if (typeof u === 'string') {
      var parsed = url.parse(u);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        /**
         * The URL
         * @type {Object}
         */
        this.url = parsed;
      } else {
        throw new Error('invalid protocol ' + parsed.protocol + ', expected \'http:\' or \'https:\'');
      }
    } else this.url = u;

    this.url.query = {};
  }

  /**
   * Sets the query string, an be called multiple times
   * @param {String|Object} queryString The qeury string as an Object or a String
   * @param {?Function} parse A custom query string parser (e.g. `require('qs').parse`)
   * @returns {HttpRequest}
   */


  _createClass(HttpRequest, [{
    key: 'query',
    value: function query(_query, parse) {
      if (!parse) parse = querystring.parse;
      Object.assign(this.url.query, typeof _query === 'string' ? parse(_query) : _query);
      this.url = url.parse(url.format(this.url));
      return this;
    }

    /**
     * Sets headers, an be called multiple times
     * @param {String|Object} nameOrObject Either a header name or a object containing headers
     * @param {?String} value Header value, ignored if `nameOrObject` is an Object
     * @returns {HttpRequest}
     */

  }, {
    key: 'set',
    value: function set(nameOrObject, value) {
      if (typeof nameOrObject === 'string') {
        this.headers[nameOrObject.toString()] = value.toString();
      } else {
        Object.assign(this.headers, nameOrObject);
      }

      return this;
    }

    /**
     * Sends content. If `Content-Type` is not set before this and `content` is an Object,
     * it will automatically be set to `application/json`, however, if it is set to
     * `application/x-www-form-urlencoded`, the data will be url encoded.
     * @param {String|Object|Buffer} content Content to be sent.
     * @param {?String} encoding Encoding to be used while decoding the Buffer
     * @returns {HttpRequest}
     */

  }, {
    key: 'send',
    value: function send(content, encoding) {
      if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
        if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
          this.body = querystring.stringify(content);
        } else {
          this.body = JSON.stringify(content);
          this.set('Content-Type', 'application/json');
        }
      } else {
        this.body = content;
        this.encoding = encoding;
      }

      return this;
    }
  }, {
    key: 'request',
    value: function request(u, redirects) {
      var _this = this;

      return new Promise(function (resolve) {
        var module = void 0;
        if (u.protocol === 'http:') {
          module = http;
        } else if (u.protocol === 'https:') {
          module = https;
        }

        var req = module.request(Object.assign({}, u, {
          method: _this.method,
          headers: _this.headers
        }), function (res) {
          if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
            _this.request(url.parse(res.headers.location), redirects += 1).then(resolve);
          } else {
            new HttpResponse(_this, res).getData(_this, res).then(resolve);
          }
        });

        req.end(_this.body, _this.encoding);
      });
    }

    /**
     * @callback callback
     * @param {Error} err The error, if any
     * @param {HttpResponse} res The http response
     */

    /**
     * Sends the request.
     * @param {callback} callback The callback
     */

  }, {
    key: 'end',
    value: function end(callback) {
      this.request(this.url, 0).then(function (res) {
        if (res.statusCode < 400) {
          callback(null, res);
        } else {
          callback(res);
        }
      });
    }

    /**
     * @callback promiseCallback
     * @param {HttpResponse} res The http response
     */

    // Adapted from superagent
    /**
     * Standard promise stuff
     * @param {promiseCallback} resolve Called if the request succeeded
     * @param {promiseCallback} reject Called if the request failed
     * @returns {HttpRequest}
     */

  }, {
    key: 'then',
    value: function then(resolve, reject) {
      var _this2 = this;

      if (!this._promise) {
        if (this._endCalled) {
          console.warn('Warning: request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
        }
        this._promise = new Promise(function (innerResolve, innerReject) {
          _this2.end(function (err, res) {
            if (err) innerReject(err);else innerResolve(res);
          });
        });
      }
      this._promise.then(resolve, reject);
      return this;
    }

    /**
     * Standard promise stuff
     * @param {promiseCallback} cb Called if the request failed
     * @returns {HttpRequest}
     */

  }, {
    key: 'catch',
    value: function _catch(cb) {
      this.then(null, cb);
      return this;
    }
  }]);

  return HttpRequest;
}();

module.exports = HttpRequest;