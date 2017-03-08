# tinyhttp
A small http module with almost no dependencies 🎉

For `multipart/form-data` support, the `form-data` package is required.

[Docs](https://hackzzila.github.io/tinyhttp/)  
Browser builds are available [here](web)

## Example
```js
const http = require('.');

http.get('https://httpbin.org/get')
  .then((res) => {
    console.log(res.body);
  })
```