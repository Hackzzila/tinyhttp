'use strict';

var HttpRequest = require('./HttpRequest');
var HttpResponse = require('./HttpResponse');

module.exports = {};

/**
 * Makes a new request
 * @function request
 * @param {String} method The method
 * @param {String} url The url
 * @returns {HttpRequest}
 */
module.exports.request = function (method, url) {
  return new HttpRequest(method, url);
};

/**
 * Makes a GET request
 * @function get
 * @param {String} url The url
 * @returns {HttpRequest}
 */
module.exports.get = function (url) {
  return new HttpRequest('GET', url);
};

/**
 * Makes a POST request
 * @function post
 * @param {String} url The url
 * @returns {HttpRequest}
 */
module.exports.post = function (url) {
  return new HttpRequest('POST', url);
};

/**
 * Makes a PUT request
 * @function put
 * @param {String} url The url
 * @returns {HttpRequest}
 */
module.exports.put = function (url) {
  return new HttpRequest('PUT', url);
};

/**
 * Makes a PATCH request
 * @function patch
 * @param {String} url The url
 * @returns {HttpRequest}
 */
module.exports.patch = function (url) {
  return new HttpRequest('PATCH', url);
};

/**
 * Makes a DELETE request
 * @function del
 * @param {String} url The url
 * @returns {HttpRequest}
 */
module.exports.del = function (url) {
  return new HttpRequest('DELETE', url);
};

/**
 * Makes a DELETE request
 * @function delete
 * @param {String} url The url
 * @returns {HttpRequest}
 */
module.exports.delete = function (url) {
  return new HttpRequest('DELETE', url);
};

module.exports.HttpRequest = HttpRequest;
module.exports.HttpResponse = HttpResponse;