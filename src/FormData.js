const stream = require('stream');
const crypto = require('crypto');

let fsReadStream;
try {
  fsReadStream = require('fs').ReadStream; // eslint-disable-line global-require
} catch (err) { } // eslint-disable-line no-empty

class FormData {
  constructor() {
    this.boundary = `----------------------${crypto.randomBytes(32).toString('hex')}`;
    this.data = Buffer.alloc(0);
  }

  getHeaders() {
    return { 'Content-Type': `multipart/form-data; boundary=${this.boundary}` };
  }

  append(name, data, filename) {
    let buffer = data;
    let headers = `\n--${this.boundary}\nContent-Disposition: form-data; name="${name}"`;

    if (filename) headers += `; filename="${filename}"`;
    else if (fsReadStream && data instanceof fsReadStream) headers += `; filename="${data.path}"`;

    if (data instanceof Buffer) {
      headers += '\nContent-Type: application/octet-stream';
      buffer = data;
    } else if (typeof data === 'object') {
      headers += '\nContent-Type: application/json';
      buffer = Buffer.from(JSON.stringify(data));
    } else if (!(data instanceof stream.Readable)) {
      buffer = Buffer.from(String(data));
    }

    if (data instanceof stream.Readable) {
      data.on('data', b => buffer = Buffer.concat(buffer, b)); // eslint-disable-line
      data.on('end', () => this.data = Buffer.concat([this.data, new Buffer(`${headers}\n\n`), buffer])); // eslint-disable-line
    } else {
      this.data = Buffer.concat([this.data, new Buffer(`${headers}\n\n`), buffer]);
    }
  }

  end() {
    this.data = Buffer.concat([
      this.data,
      new Buffer(`\n--${this.boundary}--`),
    ]);
    return this.data;
  }
}

module.exports = FormData;
