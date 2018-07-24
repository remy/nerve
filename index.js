#!/usr/bin/env node
const handler = require('serve-handler');
const { createServer } = require('http');
const { parse } = require('url');
const cwd = process.cwd();
const next = require(`${cwd}/node_modules/next`);
const loadConfig = require('./config');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => loadConfig(cwd, cwd, process.argv))
  .then(config => {
    createServer((req, res) => {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      handler(req, res, config, {
        sendError: async (absolutePath, response) => {
          const parsedUrl = parse(req.url, true);
          handle(req, response, parsedUrl);
        },
      });
    }).listen(3000, err => {
      if (err) throw err;
    });
  })
  .catch(err => {
    setTimeout(() => {
      throw err;
    }, 0);
  });
