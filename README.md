# Nerve: A hybrid Next.js & Serve server

This is a development tool for Next.js based projects that are destined for static export and serving using [Zeit's Now static hosting](https://zeit.co/now) (which uses [serve-handler](https://github.com/zeit/serve-handler) under the hood).

Specifically, `nerve` will read a configuration, apply the static rules (like `headers` and `redirects`) to requests _and_ serve your Next.js project.

**Important:** this tool is _only_ for the development phase.

## Motivation

I wanted to serve a `service-worker.js` from the root of the project, which I could do once I had exported the Next project, but not during development. I had [a server](https://git.io/fN490) but it was the same boilerplate so I decided to codify my solution.

## Usage

Install Nerve as a dev dependency or a global dependencies and run the executable `nerve` command in your Next.js project directory:

```bash
$ npm install --global @remy/nerve
$ nerve

DONE  Compiled successfully in 2585ms
INFO: Discovered configuration in `now.json`
```

## Important caveat

The config setting `"trailingSlash"` must be set to `false` during development. This is because when the client side Next.js <abb title="hot module reload">HMR</abb> looks for the URL to monitor, it does without a trailing slash, and by adding a `/` - Next responds with a `404`.

## Example

Once `nerve` is running, I can test with the `curl` command:

```bash
$ curl http://localhost:3000 -I # response from Next handler
HTTP/1.1 200 OK
X-Powered-By: Next.js 6.1.1
Cache-Control: no-store, must-revalidate
Content-Type: text/html; charset=utf-8

$ curl http://localhost:3000/service-worker.js -I # response from serve config
HTTP/1.1 200 OK
Content-Disposition: inline; filename="service-worker.js"
Content-Type: application/javascript; charset=utf-8
Cache-Control: no-cache
```

And the `now.json` config I'm using:

```json
{
  "type": "static",
  "static": {
    "trailingSlash": false,
    "headers": [
      {
        "source": "/static/service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "/service-worker.js",
        "destination": "/static/service-worker.js"
      },
    ]
  }
}

```

## Config support

Nerve, as per [serve](https://github.com/zeit/serve), will for a config in `package.json`, `now.json` and `serve.json` (note that Nerve does not support command line arguments).

[A full list of options can be seen here](https://github.com/zeit/serve-handler#options)

## License

- MIT / https://rem.mit-license.org
