const path = require('path');
const chalk = require('chalk');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);

const warning = message => chalk`{yellow WARNING:} ${message}`;
const info = message => chalk`{magenta INFO:} ${message}`;
const error = message => chalk`{red ERROR:} ${message}`;

const loadConfig = async (cwd, entry, args) => {
  const files = ['serve.json', 'now.json', 'package.json'];

  if (args['--config']) {
    files.unshift(args['--config']);
  }

  const config = {};

  for (const file of files) {
    const location = path.join(entry, file);
    let content = null;

    try {
      content = await readFile(location, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        continue;
      }

      console.error(error(`Not able to read ${location}: ${err.message}`));
      process.exit(1);
    }

    try {
      content = JSON.parse(content);
    } catch (err) {
      console.error(
        error(`Could not parse ${location} as JSON: ${err.message}`)
      );
      process.exit(1);
    }

    if (typeof content !== 'object') {
      console.error(
        warning(`Didn't find a valid object in ${location}. Skipping...`)
      );
      continue;
    }

    try {
      switch (file) {
        case 'now.json':
          content = content.static;
          break;
        case 'package.json':
          content = content.now.static;
          break;
      }
    } catch (err) {
      continue;
    }

    Object.assign(config, content);
    console.log(info(`Discovered configuration in \`${file}\``));

    break;
  }

  if (entry) {
    const { public } = config;
    config.public = path.relative(
      cwd,
      public ? path.join(entry, public) : entry
    );
  }

  // if (Object.keys(config).length !== 0) {
  //   const ajv = new Ajv();
  //   const validateSchema = ajv.compile(schema);

  //   if (!validateSchema(config)) {
  //     const defaultMessage = error('The configuration you provided is wrong:');
  //     const { message, params } = validateSchema.errors[0];

  //     console.error(`${defaultMessage}\n${message}\n${JSON.stringify(params)}`);
  //     process.exit(1);
  //   }
  // }

  return config;
};

module.exports = loadConfig;
