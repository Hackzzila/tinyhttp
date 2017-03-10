const http = require('http');
const https = require('https');

class HttpServer {
  constructor(options) {
    if (!options) options = {};

    if (options.https) this.http = https;
    else this.http = http;

    this.server = this.http.createServer();
  }

  listen(port, callback) {
    return new Promise((resolve, reject) => {
      this.server.listen(port, (err) => {
        if (err) {
          if (callback) callback(err);
          reject(err);
        } else if (callback) callback();
        else resolve();
      });
    });
  }
}

module.exports = HttpServer;
