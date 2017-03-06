const url = require('url');
const zlib = require('zlib');
const querystring = require('querystring');

/**
 * A response
 */
class HttpResponse {
  constructor(req, res) {
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

  getData(req, res) {
    return new Promise((resolve) => {
      let stream;
      if (this.headers['content-encoding'] === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (this.headers['content-encoding'] === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      } else stream = res;

      stream.on('data', (chunk) => {
        this.buffer = Buffer.concat([this.buffer, chunk]);
      });

      stream.on('end', () => {
        this.text = this.buffer.toString();

        if (this.headers['content-type'] === 'application/json') this.body = JSON.parse(this.buffer);
        else if (this.headers['content-type'] === 'application/x-www-form-urlencoded') this.body = querystring.parse(this.buffer);

        resolve(this);
      });
    });
  }

  toString() {
    return `${this.statusCode} ${this.statusMessage} ${url.format(this.req.url)}`;
  }
}

module.exports = HttpResponse;
