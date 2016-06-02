/**
 * JS parsing task.
 */
'use strict';

module.exports = grunt => {

	const formatter = require( '../lib/formatter' );
	const path      = require( 'path' ).resolve;
	const JSCS      = require( 'jscs' );
	const Promise   = require( 'bluebird' );
	const readAsync = Promise.promisify( require( 'fs' ).readFile );

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

			// Configures JSCS.
			const checker = new JSCS();
			checker.registerDefaultRules();
			checker.configure({ preset: 'wordpress' });

			// Configures JSHint.
			const jshint   = require( 'jshint' ).JSHINT;
			let options  = Object.assign(
				require( '../presets/jshint.json' ), // Copied from WP trunk.
				settings.jshint
			);

			let promises = [];

			this.filesSrc.forEach( file => {
				let promise = readAsync( file, 'utf-8' );

				promise.then( code => {
					formatter.file( file );

					let count  = 0;
					let errors = checker.checkString( code );
					errors.getErrorList().forEach( error => {
						formatter({
							line: error.line,
							char: error.column + 1,
							text: error.message
						});
					});
					count += errors.getErrorList().length;

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
						});
					});
					count += jshint.errors.length;

					formatter.total( count );
				});

				promises.push( promise );
			});

			// Exit once everything is done.
			Promise.all( promises ).then( () => {
				formatter.checked( this.filesSrc );
				done();
			});
		}
	);
};
