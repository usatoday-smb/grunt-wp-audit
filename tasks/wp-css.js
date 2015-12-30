/**
 * CSS parsing task.
 */
'use strict';

module.exports = grunt => {

	const pluralize = ( word, count ) => {
		return 1 === count ? word : word + 's';
	};

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

			const formatter = results => {
				var frmtr = require( 'postcss-reporter/lib/formatter' )({
					noPlugin: true
				});

				return results.reduce( ( output, result ) => {
					output += frmtr({
						messages: result.warnings,
						source:   result.source
					});
					return output;
				}, '' );
			};

			let stylelint = require( 'stylelint' );

			stylelint.lint({
				files: this.filesSrc,
				config: require( 'stylelint-config-wordpress' ),
				configOverrides: options.config,
				formatter: formatter
			}).then( data => {

				let count = data.results.length;

				if ( ! data.output ) {
					grunt.log.ok( count + ' ' + pluralize( 'file', count ) + ' checked.' );
				} else {
					grunt.log.writeln( data.output );
					grunt.log.errorlns( count + ' ' + pluralize( 'error', count ) + ' found.' );
				}

				done();
			});
		}
	);
};
