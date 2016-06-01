/**
 * JS parsing task.
 */
'use strict';

module.exports = grunt => {

	const formatter = require( '../lib/formatter' );
	const path      = require( 'path' ).resolve;
	const JSCS      = require( 'jscs' );

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
				jshint.errors.forEach( error => {
					if ( ! error ) {
						return;
					}
					formatter({
						line: error.line,
						char: error.character,
						text: error.reason
					}, grunt );
				});
				formatter.total( jshint.errors, grunt );
			});

			// Runs JSCS.
			let checker = new JSCS();
			checker.registerDefaultRules();
			checker.configure({ preset: 'wordpress' });

			this.filesSrc.forEach( file => {
				formatter.file( file, grunt );
				let code = grunt.file.read( file );
				let errors = checker.checkString( code );

				errors.getErrorList().forEach( error => {
					formatter({
						line: error.line,
						char: error.column + 1,
						text: error.message
					}, grunt );
				});
				formatter.total( errors.getErrorList(), grunt );
			});

			// We're done here!
			done();

		}
	);
};
