/**
 * PHP parsing task.
 */
'use strict';

module.exports = grunt => {

	const formatter = require( '../lib/formatter' );
	const Promise   = require( 'bluebird' );
	const exec      = require( 'child_process' ).exec;
	const execAsync = Promise.promisify( exec );
	const path      = require( 'path' );
	const _         = require( 'lodash' );

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
				maxFiles: 20,
				maxProcesses: 10,
				maxBuffer: 200 * 1024,
				phplint: {},
				phpcs: {}
			};

			let opts = this.options();
			for ( let key in opts ) {
				Object.assign( settings[ key ], opts[ key ] );
			}

			if ( settings.maxProcesses < 1 ) {
				settings.maxProcesses = Infinity;
			}

			// Runs PHPLint.
			let phplint = Promise.map( this.filesSrc, file => {
				let cmd = `php -d display_errors=1 -l ${ file }`;
				grunt.log.debug( 'Command: ' + cmd );

				return new Promise( ( res, rej ) => {
					let child = exec( cmd, { maxBuffer: settings.maxBuffer } );
					child.addListener( 'error', rej );
					child.stdout.addListener( 'data', res );
				})
				.then( stdout => {
					if ( 'No syntax errors detected in' !== stdout.substr( 0, 28 ) ) {
						return { file, error: stdout.match( /line (\d+)/ )[1] }
					} else {
						return { file, error: false };
					}
				})
				.catch( err => {
					if ( err.cmd ) {
						grunt.log.error( 'Failed command:' );
						grunt.log.writeln( err.cmd );
					}
					throw err;
				});
			}, { concurrency: settings.maxProcesses } )
			.then( results => {
				grunt.verbose.ok( 'Processed PHP lint successfully.' );

				let files = {};
				results.forEach( result => {
					if ( ! result.error ) {
						return;
					}
					files[ path.relative( process.cwd(), result.file ) ] = [{
						line: Number.parseInt( result.error ),
						char: 1,
						text: 'Parse error.'
					}];
				});
				return files;
			});

			// Runs PHPCS.
			let command  = [];
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

			if ( settings.maxFiles > 1 ) {
				let chunk = settings.maxFiles;
				for ( let i = 0; i < this.filesSrc.length; i += chunk ) {
					fileArr.push( this.filesSrc.slice( i, i + chunk ) );
				}
			} else {
				fileArr = [ this.filesSrc ];
			}

			let phpcs = Promise.map( fileArr, files => {
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
			}, { concurrency: settings.maxProcesses } )
			.map( output => {
				grunt.verbose.ok( 'Processed PHPCS successfully.' );
				let files = {};
				_.each( output, ( val, key ) => {
					let errors = val.messages;
					if ( ! errors.length ) {
						return;
					}
					errors = errors.map( msg => {
						let message = msg.message;

						if ( grunt.option( 'debug' ) ) {
							message += ' (' + msg.source + ')';
						}

						return {
							line: msg.line,
							char: msg.column,
							text: message
						};
					});
					files[ path.relative( process.cwd(), key ) ] = errors;
				});
				return files;
			})
			.then( output => _.merge.apply( _, output ) );

			Promise.join(
				phplint, phpcs,
				( lint, cs ) => _.mergeWith(
					lint, cs,
					( old, src ) => [].concat( _.toArray( old ), _.toArray( src ) )
				)
			)
			.then( errors => {
				_.each( errors, ( errors, file ) => {
					formatter.file( file );
					errors.forEach( error => formatter( error ) );
					formatter.total( errors );
				});
				formatter.checked( this.filesSrc );
				done();
			})
			.catch( err => grunt.fail.warn( err ) );
		}
	);
};
