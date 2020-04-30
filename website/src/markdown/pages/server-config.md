# Server Configuration

If your app works fine until you hit "reload" or manually type in a URL and then get a 404 error, then your server is not configured correctly.

Whether you are server-rendering or not, all apps using Reach Router need to be configured to deliver the same JavaScript code at every URL.

For non-server rendered apps, we recommend develping with [create react app](https://github.com/facebook/create-react-app), and for your production file server [we recommend `serve`](https://github.com/zeit/serve#readme).

If you can't use either of these tools, you will need to learn how to configure your server to serve your `index.html` file at every url.

Here's an example in express:

```js
const path = require("path")
const express = require("express")
const app = new express()

// requests for static files in the "public" directory
// like JavaScript, CSS, images will be served
app.use(express.static("public"))

// Every other request will send the index.html file that
// contains your application
app.use("*", function(req, resp) {
  resp.sendFile("/public/index.html")
})

app.listen("8000")
```

Paul Sherman has written an in-depth article about this, if you're still unclear we recommend you give it a read: [Single-Page Applications and the Server](https://blog.pshrmn.com/single-page-applications-and-the-server/)
