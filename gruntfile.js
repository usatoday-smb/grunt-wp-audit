/**
 * Grunt Wordpress helper and validator.
 * @author Ephraim Gregor <egregor@usatoday.com>
 * @copyright MIT
 * @version 1.0.0
 * @package grunt-wp-audit
 */
'use strict';

 module.exports = grunt => {
 	grunt.initConfig({
 		'wp-css': {
			src: 'fixtures/*.css'
		},
		'wp-js': {
			options: {
				jshint: {
					devel: true
				},
			},
			src: '/Users/egregor/Dev/quickstart/www/wp-content/themes/vip/lawrence/**/*.js'
		},
		'wp-php': {
			src: 'fixtures/*.php'
		}
 	});

	grunt.loadTasks( 'tasks' );
};
