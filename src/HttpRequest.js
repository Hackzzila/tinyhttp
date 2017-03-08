const url = require('url');
const http = require('http');
const https = require('https');
const stream = require('stream');
const MimeUtils = require('./MimeUtils');
const querystring = require('querystring');
const HttpResponse = require('./HttpResponse');

let zlib;
try {
  zlib = require('zlib'); // eslint-disable-line global-require
} catch (err) { } // eslint-disable-line no-empty

let FormData;
try {
  FormData = require('form-data'); // eslint-disable-line global-require, import/no-extraneous-dependencies
} catch (err) { } // eslint-disable-line no-empty

/**
 * A HTTP request, returned by all request methods.
 * @extends {stream.Readable}
 */
class HttpRequest extends stream.Readable {
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
  constructor(method, u) {
    super();

    /**
     * The HTTP method
     * @type {String}
     */
    this.method = method;

    /**
     * The headers to be sent, can be manipulated easily with {@link HttpRequest#set}
     * @type {Object}
     */
    this.headers = { 'User-Agent': 'node-tinyhttp', 'Accept-Encoding': zlib ? 'gzip, deflate' : '' };

    /**
     * The request body, can be manipulated easily with {@link HttpRequest#send}
     * or {@link HttpRequest#field} and {@link HttpRequest#attach}.
     * Do not depend on this value before the request is sent
     * @type {Buffer|String}
     */
    this.body = null;

    /**
     * The request body encoding, if used, can be manipulated easily with {@link HttpRequest#send}
     * @type {String}
     */
    this.encoding = null;

    if (typeof u === 'string') {
      const parsed = url.parse(u);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        /**
         * The URL
         * @type {Object}
         */
        this.url = parsed;
      } else {
        throw new Error(`invalid protocol ${parsed.protocol}, expected 'http:' or 'https:'`);
      }
    } else this.url = u;

    this.url.query = {};
  }

  _read() {
    if (!this._endCalled) {
      this._endCalled = true;
      this.request(this.url, 0, true)
        .then((res) => {
          let str;
          if (zlib && res.headers['content-encoding'] === 'gzip') {
            str = res.pipe(zlib.createGunzip());
          } else if (zlib && res.headers['content-encoding'] === 'deflate') {
            str = res.pipe(zlib.createInflate());
          } else if (res.headers['content-encoding'] === 'gzip' || res.headers['content-encoding'] === 'deflate') {
            throw new Error('\'zlib\' not foind');
          } else str = res;

          str.on('data', chunk => this.push(chunk));
          str.on('end', () => this.emit('end'));
        });
    }
  }

  /**
   * Sets the query string, an be called multiple times
   * @param {String|Object} queryString The qeury string as an Object or a String
   * @param {?Function} parse A custom query string parser (e.g. `require('qs').parse`)
   * @returns {HttpRequest}
   */
  query(query, parse) {
    if (!parse) parse = querystring.parse;
    Object.assign(this.url.query, typeof query === 'string' ? parse(query) : query);
    this.url = url.parse(url.format(this.url));
    return this;
  }

  /**
   * Sets headers, an be called multiple times
   * @param {String|Object} nameOrObject Either a header name or a object containing headers
   * @param {?String} value Header value, ignored if `nameOrObject` is an Object
   * @returns {HttpRequest}
   */
  set(nameOrObject, value) {
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
  field(name, content) {
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
   * @param {?String} contentType The content type. This is not required, but will override
   * the default content type pulled from the file's extension.
   * @returns {HttpRequest}
   */
  attach(name, content, filename, contentType) {
    if (!FormData) throw new Error('\'form-data\' is not installed');
    if (!this._form) this._form = new FormData();

    if (filename && !contentType) contentType = MimeUtils.contentType(filename);

    this._form.append(name, content, { filename, contentType });

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
  send(content, encoding) {
    if (typeof content === 'object') {
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

  request(u, redirects, isStream) {
    return new Promise((resolve) => {
      let module;
      if (u.protocol === 'http:') {
        module = http;
      } else if (u.protocol === 'https:') {
        module = https;
      }

      const req = module.request(Object.assign({}, u, {
        method: this.method,
        headers: Object.assign(this.headers, this._form ? this._form.getHeaders() : {}),
      }), (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode)
        && res.headers.location && redirects < 5) {
          this.request(url.parse(res.headers.location), redirects += 1).then(resolve);
        } else if (!isStream) (new HttpResponse(this, res)).getData(this, res).then(resolve);
        else {
          this.emit('response', new HttpResponse(this, res));
          resolve(res);
        }
      });

      if (this._form) this._form.pipe(req);
      else req.end(this.body, this.encoding);
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
  end(callback) {
    this._endCalled = true;
    this.request(this.url, 0).then((res) => {
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
  then(resolve, reject) {
    if (!this._promise) {
      if (this._endCalled) {
        console.warn('Warning: request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
      }
      this._promise = new Promise((innerResolve, innerReject) => {
        this.end((err, res) => {
          if (err) innerReject(err); else innerResolve(res);
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
  catch(cb) {
    return this.then(null, cb);
  }
}

module.exports = HttpRequest;
