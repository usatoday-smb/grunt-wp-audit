/**
 * CSS parsing task.
 */
'use strict';

module.exports = grunt => {

	const formatter = require( '../lib/formatter' );

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

			const fileCount = this.filesSrc.length;

			stylelint.lint({
				files: this.filesSrc,
				config: require( 'stylelint-config-wordpress' ),
				configOverrides: options.config
			}).then( data => {

				data.results.forEach( result => {
					formatter.file( result.source, grunt );

					if ( result.errored ) {
						result.warnings.forEach( error => {
							formatter({
								line: error.line,
								char: error.column,
								text: error.text
							}, grunt );
						});
					}
					formatter.total( result.warnings, grunt );
				});

				let files = grunt.util.pluralize( fileCount, 'file/files' );
				grunt.log.ok( fileCount + ' ' + files + ' checked.' );

				done();
			});
		}
	);
};
