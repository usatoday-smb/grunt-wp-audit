/**
 * JS parsing task.
 */
'use strict';

module.exports = grunt => {

	const formatter = require( '../lib/formatter' );
	const path      = require( 'path' ).resolve;

	const reporter = ( results ) => {

		if ( 0 === results.length ) {
			return grunt.log.ok();
		}

		results.forEach( error => {
			formatter({
				line: error.line,
				char: error.character,
				text: error.reason
			}, grunt );
		});

		formatter.total( results, grunt );
	};

	grunt.registerMultiTask(
		'wp-js',
		'Validate JS to WordPress style.',
		function() {
			const done = this.async();

			// Exit if we're not ready.
			if ( ! this.files.length ) {
				grunt.log.error( 'No files provided!' );
				return done();
			}

			// Set the options.
			const settings = this.options({ jshint: {}, jscs: {} });

			// Runs JSHint.
			const jshint   = require( 'jshint' ).JSHINT;
			const options  = Object.assign(
				require( '../presets/jshint.json' ), // Copied from WP trunk.
				settings.jshint
			);

			this.filesSrc.map( file => {
				formatter.file( file, grunt );
				jshint(
					grunt.file.read( file ),
					options,
					options.globals
				);
				reporter( jshint.errors );
			});

			// Runs JSCS.
			const configKey = Date.now();
			grunt.config.merge({
				jscs: {
					[ configKey ] : {
						src: this.filesSrc,
						options: Object.assign(
							settings.jscs,
							{ config: path( __dirname, '../presets/jscs.json' ) }
						)
					}
				}
			});
			grunt.loadNpmTasks( 'grunt-jscs' );
			grunt.task.run( 'jscs:' + configKey );

			// We're done here!
			done();

		}
	);
};
