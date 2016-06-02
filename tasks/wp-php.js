/**
 * PHP parsing task.
 */
'use strict';

module.exports = grunt => {

	const formatter = require( '../lib/formatter' );
	const Promise   = require( 'bluebird' );
	const execAsync = Promise.promisify( require( 'child_process' ).exec );
	const path      = require( 'path' );

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
			const settings  = {
				phplint: {},
				phpcs: {
					maxFiles: 20,
					maxProcesses: 10,
					maxBuffer: 200 * 1024
				}
			};
			const configKey = Date.now();

			let opts = this.options();
			for ( let key in opts ) {
				Object.assign( settings[ key ], opts[ key ] );
			}

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
			let command = [];
			let standard = settings.phpcs.standard;

			// Set up the command.
			command.push( 'echo "" |' ); // Provide a STDIN, so PHPCS doesn't hang as of 2.6.1.
			command.push( path.relative(
				process.cwd(),
				path.resolve( __dirname, '../php/phpcs' )
			) );

			command.push( `--standard=${ standard ? standard : 'WordPress' }` );
			command.push( '--report=json' );

			// Chunk up the files.
			let fileArr = [];

			if ( settings.phpcs.maxFiles > 1 ) {
				let chunk = settings.phpcs.maxFiles;
				for ( let i = 0; i < this.filesSrc.length; i += chunk ) {
					fileArr.push( this.filesSrc.slice( i, i + chunk ) );
				}
			} else {
				fileArr = [ this.filesSrc ];
			}

			if ( settings.phpcs.maxProcesses < 1 ) {
				settings.phpcs.maxProcesses = Infinity;
			}

			Promise.map( fileArr, files => {
				let cmd = command.concat( files ).join( ' ' );
				grunt.log.debug( 'Command: ' + cmd );

				return execAsync( cmd, { maxBuffer: settings.phpcs.maxBuffer } )
				.then( stdout => {
					let output = JSON.parse( stdout );
					return output.files;
				})
				.catch( err => {
					if ( err.cmd ) {
						grunt.log.error( 'Failed command:' );
						grunt.log.writeln( err.cmd );
					}
					throw err;
				});
			}, { concurrency: settings.phpcs.maxProcesses } )
			.each( output => {
				grunt.verbose.ok( 'Processed PHPCS successfully.' );
				for ( let key in output ) {
					formatter.file( path.relative( process.cwd(), key ) );

					let val    = output[ key ],
						errors = val.messages;

					if ( errors.length ) {
						errors.forEach( msg => {
							formatter({
								line: msg.line,
								char: msg.column,
								text: msg.message
							});
						});
					}

					formatter.total( errors );
				}
			})
			.then( () => {
				formatter.checked( this.filesSrc );
				done();
			})
			.catch( err => grunt.fail.warn( err ) );
		}
	);
};
