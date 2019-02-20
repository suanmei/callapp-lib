module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'root',
        'common',
        'component',
        'server',
        'router',
      ],
    ],
    'scope-empty': [2, 'never'],
  },
};
