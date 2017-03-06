# tinyhttp
A small http module with no dependencies 🎉

## Example
```js
const http = require('.');

http.get('https://httpbin.org/get')
  .then((res) => {
    console.log(res.body);
  })
```