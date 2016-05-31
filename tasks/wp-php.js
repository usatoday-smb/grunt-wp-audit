/**
 * PHP parsing task.
 */
'use strict';

module.exports = grunt => {

	const formatter = require( '../lib/formatter' );

	grunt.registerMultiTask(
		'wp-php',
		'Validate PHP to WordPress style.',
		function() {
			const done = this.async();

			// Exit if we're not ready.
			if ( ! this.filesSrc.length ) {
				grunt.log.error( 'No files provided!' );
				return done();
			}

			// Set the options.
			const settings  = this.options({ phplint: {}, phpcs: {} });
			const configKey = Date.now();

			// Runs PHPLint.
			grunt.config.merge({
				phplint: {
					[ configKey ] : {
						src: this.filesSrc,
						options: settings.phplint
					}
				}
			});
			grunt.loadNpmTasks( 'grunt-phplint' );
			grunt.task.run( 'phplint:' + configKey );

			// Runs PHPCS.
			const exec = require( 'child_process' ).exec;
			const path = require( 'path' );

			let command = path.relative(
				process.cwd(),
				path.resolve( __dirname, '../php/phpcs' )
			);
			let args = [];
			let standard = settings.phpcs.standard;

			args.push( `--standard=${ standard ? standard : 'WordPress' }` );
			args.push( '--report=json' );
			args.push( this.filesSrc.join( ' ' ) );

			command += ' ' + args.join( ' ' );

			grunt.log.debug( 'Command: ' + command );

			let proc = exec( command, { maxBuffer: 200 * 1024 }, ( error, stdout, stderr ) => {

				let output = JSON.parse( stdout );

				if ( output.files ) {
					for ( let key in output.files ) {
						formatter.file(
							path.relative( process.cwd(), key ),
							grunt
						);

						let val    = output.files[ key ],
						    errors = val.messages;

						if ( errors.length ) {
							errors.forEach( msg => {
								formatter({
									line: msg.line,
									char: msg.column,
									text: msg.message
								}, grunt );
							});
						}

						formatter.total( errors, grunt );
					}
				}

				// We're done here!
				done();
			});

			grunt.log.debug( 'Process: ' + proc.pid );
		}
	);
};
