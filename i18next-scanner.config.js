const fs = require('fs');
const path = require('path');

module.exports = {
  input: [
    'src/**/*.{js,ts,tsx}',
    '!src/i18n/**', // Ignore i18n config files
    '!**/node_modules/**'
  ],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['t', 'i18n.t'],
      extensions: ['.js', '.ts', '.tsx']
    },
    trans: false,
    img: false,
    lvl: 99
  },
  transform: function customTransform(file, enc, callback) {
    'use strict';
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    parser.parseFuncFromString(content, {
      options: this.options,
      defaultValue: (key, options) => key
    }, (key, value) => {
      // increase count by number of keys
      count += key.split(/\n/).length;
    });

    callback(null, content);
  },
  nsSeparator: false,
  keySeparator: false,
  interpolation: {
    prefix: '{{',
    suffix: '}}'
  }
};