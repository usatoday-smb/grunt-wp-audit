/**
 * CSS parsing task.
 */
'use strict';

module.exports = grunt => {

	const formatter = require( '../lib/formatter' );
	const Promise   = require( 'bluebird' );

	grunt.registerMultiTask(
		'wp-css',
		'Validate CSS to WordPress style.',
		function() {
			const done = this.async();

			if ( ! this.files.length ) {
				grunt.log.error( 'No files provided!' );
				return done();
			}

			let options = this.options({
				config: {}
			});

			let stylelint = require( 'stylelint' );
			let promises  = [];

			this.filesSrc.forEach( file => {
				let promise = stylelint.lint({
					files: file,
					config: require( 'stylelint-config-wordpress' ),
					configOverrides: options.config
				}).then( data => {
					data.results.forEach( result => {
						if ( result.errored ) {
							formatter.file( result.source );
							result.warnings.forEach( error => {
								formatter({
									line: error.line,
									char: error.column,
									text: error.text
								});
							});
						}
						formatter.total( result.warnings );
					});
				});
				promises.push( promise );
			});

			Promise.all( promises ).then( () => {
				formatter.checked( this.filesSrc );
				done();
			});
		}
	);
};
