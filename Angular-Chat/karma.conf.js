//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: './src',

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
	  'bower_components/jquery/src/jquery.js',
      '**/*.module.js',
      '*!(.module|.spec).js',
      '!(bower_components)/**/*!(.module|.spec).js',
      '**/*.spec.js'
    ],

    autoWatch: true,

    browsers: ['Chrome', 'Firefox'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ]

  });
};
