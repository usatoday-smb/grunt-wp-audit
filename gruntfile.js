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
			target: {
				src: 'fixtures/*.css'
			}
		},
		'wp-js': {
			target: {
				src: 'fixtures/*.js'
			}
		}
 	});

	grunt.loadTasks( 'tasks' );
};
