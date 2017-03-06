# tinyhttp
A small http module with no dependencies 🎉

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