'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var url = require('url');
var zlib = require('zlib');
var http = require('http');
var https = require('https');
var stream = require('stream');
var querystring = require('querystring');
var HttpResponse = require('./HttpResponse');

var FormData = void 0;
try {
  FormData = require('form-data'); // eslint-disable-line global-require, import/no-extraneous-dependencies
} catch (err) {} // eslint-disable-line no-empty

/**
 * A HTTP request, returned by all request methods.
 * @extends {stream.Readable}
 */

var HttpRequest = function (_stream$Readable) {
  _inherits(HttpRequest, _stream$Readable);

  /**
   * Emitted when a response is received when working with streams.
   * @event HttpRequest#response
   * @param {HttpResponse} res The response, minus all body related properties
   */

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
    var _this = _possibleConstructorReturn(this, (HttpRequest.__proto__ || Object.getPrototypeOf(HttpRequest)).call(this));

    _this.method = method;

    /**
     * The headers to be sent, can be manipulated easily with {@link HttpRequest#set}
     * @type {Object}
     */
    _this.headers = { 'User-Agent': 'node-tinyhttp', 'Accept-Encoding': 'gzip, deflate' };

    /**
     * The request body, can be manipulated easily with {@link HttpRequest#send}
     * or {@link HttpRequest#field} and {@link HttpRequest#attach}.
     * Do not depend on this value before the request is sent
     * @type {Buffer|String}
     */
    _this.body = null;

    /**
     * The request body encoding, if used, can be manipulated easily with {@link HttpRequest#send}
     * @type {String}
     */
    _this.encoding = null;

    if (typeof u === 'string') {
      var parsed = url.parse(u);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        /**
         * The URL
         * @type {Object}
         */
        _this.url = parsed;
      } else {
        throw new Error('invalid protocol ' + parsed.protocol + ', expected \'http:\' or \'https:\'');
      }
    } else _this.url = u;

    _this.url.query = {};
    return _this;
  }

  _createClass(HttpRequest, [{
    key: '_read',
    value: function _read() {
      var _this2 = this;

      if (!this._endCalled) {
        this._endCalled = true;
        this.request(this.url, 0, true).then(function (res) {
          var str = void 0;
          if (res.headers['content-encoding'] === 'gzip') {
            str = res.pipe(zlib.createGunzip());
          } else if (res.headers['content-encoding'] === 'deflate') {
            str = res.pipe(zlib.createInflate());
          } else str = res;

          str.on('data', function (chunk) {
            return _this2.push(chunk);
          });
          str.on('end', function () {
            return _this2.emit('end');
          });
        });
      }
    }

    /**
     * Sets the query string, an be called multiple times
     * @param {String|Object} queryString The qeury string as an Object or a String
     * @param {?Function} parse A custom query string parser (e.g. `require('qs').parse`)
     * @returns {HttpRequest}
     */

  }, {
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
     * Sets a `multipart/form-data` field
     * @param {String} name The field name
     * @param {Buffer|String|Stream} content The field content
     * @returns {HttpRequest}
     */

  }, {
    key: 'field',
    value: function field(name, content) {
      if (!FormData) throw new Error('\'form-data\' is not installed');
      if (!this._form) this._form = new FormData();

      this._form.append(name, content);

      return this;
    }

    /**
     * Attaches a file using `multipart/form-data`
     * @param {String} name The field name
     * @param {Buffer|String|Stream} content The file content
     * @param {?String} filename The file name.
     * This is not neaded for content from `fs.ReadStream`
     * @param {?String} contentType The content type.
     * This is not neaded for content from `fs.ReadStream`
     * @returns {HttpRequest}
     */

  }, {
    key: 'attach',
    value: function attach(name, content, filename, contentType) {
      if (!FormData) throw new Error('\'form-data\' is not installed');
      if (!this._form) this._form = new FormData();

      this._form.append(name, content, { filename: filename, contentType: contentType });

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
    value: function request(u, redirects, isStream) {
      var _this3 = this;

      return new Promise(function (resolve) {
        var module = void 0;
        if (u.protocol === 'http:') {
          module = http;
        } else if (u.protocol === 'https:') {
          module = https;
        }

        var req = module.request(Object.assign({}, u, {
          method: _this3.method,
          headers: Object.assign(_this3.headers, _this3._form.getHeaders())
        }), function (res) {
          if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
            _this3.request(url.parse(res.headers.location), redirects += 1).then(resolve);
          } else if (!isStream) new HttpResponse(_this3, res).getData(_this3, res).then(resolve);else {
            _this3.emit('response', new HttpResponse(_this3, res));
            resolve(res);
          }
        });

        if (_this3._form) _this3._form.pipe(req);else req.end(_this3.body, _this3.encoding);
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
      this._endCalled = true;
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
     * @returns {Promise}
     */

  }, {
    key: 'then',
    value: function then(resolve, reject) {
      var _this4 = this;

      if (!this._promise) {
        if (this._endCalled) {
          console.warn('Warning: request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
        }
        this._promise = new Promise(function (innerResolve, innerReject) {
          _this4.end(function (err, res) {
            if (err) innerReject(err);else innerResolve(res);
          });
        });
      }
      return this._promise.then(resolve, reject);
    }

    /**
     * Standard promise stuff
     * @param {promiseCallback} cb Called if the request failed
     * @returns {Promise}
     */

  }, {
    key: 'catch',
    value: function _catch(cb) {
      return this.then(null, cb);
    }
  }]);

  return HttpRequest;
}(stream.Readable);

module.exports = HttpRequest;