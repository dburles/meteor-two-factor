Package.describe({
  name: 'dburles:two-factor',
  version: '1.1.0',
  summary: 'Two-factor authentication for accounts-password',
  git: 'https://github.com/dburles/meteor-two-factor.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'check']);
  api.use('reactive-dict', 'client');
  api.use('accounts-password', 'server');
  api.addFiles('common.js');
  api.addFiles('client.js', 'client');
  api.addFiles('server.js', 'server');
  api.export('twoFactor');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('dburles:two-factor');
  api.addFiles('tests.js');
});
