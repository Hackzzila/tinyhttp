const http = require('http');
const https = require('https');
const querystring = require('querystring');

/**
 * A HTTP request, returned by all request methods.
 */
class HttpRequest {
  /**
   * Make a new HttpRequest
   * @param {String} method The HTTP method
   * @param {String|Object} url The URL, can be a String or a [URL Object]{@link https://nodejs.org/dist/latest-v7.x/docs/api/url.html#url_url_strings_and_url_objects}
   */
  constructor(method, url) {
    this.method = method;
    this.url = url;
  }
}

module.exports = HttpRequest;
