const HttpRequest = require('./src/HttpRequest');

function http(method, url) {
  return new HttpRequest(method, url);
}

http.get = url => new HttpRequest('GET', url);
http.head = url => new HttpRequest('HEAD', url);
http.put = url => new HttpRequest('PUT', url);
http.patch = url => new HttpRequest('PATCH', url);
http.del = url => new HttpRequest('DELETE', url);
http.delete = url => new HttpRequest('DELETE', url);

module.exports = http;
