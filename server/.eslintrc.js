/* eslint-disable linebreak-style */

module.exports = {
  env: {
    node: true,
    es2021: true
  },
  globals: {
    client: 'readonly',
    config: 'readonly',
    logger: 'readonly',
    passport: 'readonly',
    i18n: 'readonly'
  },
  extends: 'eslint:recommended',
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'module'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    indent: [
      'error',
      2,
      { SwitchCase: 1 }
    ],
    'linebreak-style': [
      'error',
      process.platform === 'win32' ? 'windows' : 'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'always'
    ],
    'comma-dangle': [
      'error',
      'never'
    ]
  }
};