'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var http = require('http');
var https = require('https');

var HttpServer = function () {
  function HttpServer(options) {
    _classCallCheck(this, HttpServer);

    if (!options) options = {};

    if (options.https) this.http = https;else this.http = http;

    this.server = this.http.createServer();
  }

  _createClass(HttpServer, [{
    key: 'listen',
    value: function listen(port, callback) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.server.listen(port, function (err) {
          if (err) {
            if (callback) callback(err);
            reject(err);
          } else if (callback) callback();else resolve();
        });
      });
    }
  }]);

  return HttpServer;
}();

module.exports = HttpServer;