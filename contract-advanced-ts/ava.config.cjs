require('util').inspect.defaultOptions.depth = 5;

module.exports = {
  timeout: '60s',
  files: ['sandbox-ts/*.ava.ts'],
  extensions: { ts: 'module' },
  nodeArguments: ['--import=tsx'],
};
