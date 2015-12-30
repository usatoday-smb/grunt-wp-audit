/**
 * JS parsing task.
 */
'use strict';

module.exports = grunt => {

	const formatter = require( '../lib/formatter' );

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

			if ( ! this.files.length ) {
				grunt.log.error( 'No files provided!' );
				return done();
			}

			const jshint   = require( 'jshint' ).JSHINT;
			const settings = this.options({ config: {} });
			const options  = Object.assign(
				require( '../presets/jshint.json' ), // Copied from WP trunk.
				settings.options
			);

			this.filesSrc.map( file => {
				formatter.file( file, grunt );
				let js = grunt.file.read( file );
				jshint( js, options, options.globals );
				reporter( jshint.errors );
			});
			done();

		}
	);
};