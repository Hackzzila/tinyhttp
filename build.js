const fs = require('fs');
const db = require('mime-db'); // eslint-disable-line import/no-extraneous-dependencies

const obj = { extensions: {}, types: db };
for (const type in db) {
  if (db[type].extensions) {
    for (const extension of db[type].extensions) {
      obj.extensions[extension] = type;
    }
  }
}

fs.writeFileSync('types.json', JSON.stringify(obj));
