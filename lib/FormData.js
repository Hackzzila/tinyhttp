'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var stream = require('stream');
var crypto = require('crypto');

var fsReadStream = void 0;
try {
  fsReadStream = require('fs').ReadStream; // eslint-disable-line global-require
} catch (err) {} // eslint-disable-line no-empty

var FormData = function () {
  function FormData() {
    _classCallCheck(this, FormData);

    this.boundary = '----------------------' + crypto.randomBytes(32).toString('hex');
    this.data = Buffer.alloc(0);
  }

  _createClass(FormData, [{
    key: 'getHeaders',
    value: function getHeaders() {
      return { 'Content-Type': 'multipart/form-data; boundary=' + this.boundary };
    }
  }, {
    key: 'append',
    value: function append(name, data, filename) {
      var _this = this;

      var buffer = data;
      var headers = '\n--' + this.boundary + '\nContent-Disposition: form-data; name="' + name + '"}';

      if (filename) headers += '; filename="' + filename + '"';else if (fsReadStream && data instanceof fsReadStream) headers += '; filename="' + data.path + '"';

      if (data instanceof Buffer) {
        headers += '\nContent-Type: application/octet-stream';
        buffer = data;
      } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
        headers += '\nContent-Type: application/json';
        buffer = Buffer.from(JSON.stringify(data));
      } else if (!(data instanceof stream.Readable)) {
        buffer = Buffer.from(String(data));
      }

      if (data instanceof stream.Readable) {
        data.on('data', function (b) {
          return buffer = Buffer.concat(buffer, b);
        }); // eslint-disable-line
        data.on('end', function () {
          return _this.data = Buffer.concat([_this.data, new Buffer(headers + '\n\n'), buffer]);
        }); // eslint-disable-line
      } else {
        this.data = Buffer.concat([this.data, new Buffer(headers + '\n\n'), buffer]);
      }
    }
  }, {
    key: 'end',
    value: function end() {
      this.data = Buffer.concat([this.data, new Buffer('\n--' + this.boundary + '--')]);
      return this.data;
    }
  }]);

  return FormData;
}();

module.exports = FormData;