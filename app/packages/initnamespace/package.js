Package.describe({
  name: 'druti:initnamespace',
  version: '0.1.1',
  // Brief, one-line summary of the package.
  summary: 'Initializes namespace global object',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.addFiles('initnamespace.js');
  if (api.export) {
    api.export('DEPNES');
  }
});

Package.onTest(function(api) {
  api.use('druti:initnamespace');
  api.use(['tinytest', 'test-helpers'], 'client');
  api.addFiles('initnamespace-tests.js', 'client');
});
