/**
 * Output formatter.
 */
'use strict';

const pad = 8;

module.exports = ( error, grunt ) => {

	let pos = '';
	if ( 'number' === typeof error.line && 'number' === typeof error.char ) {
		pos = ( error.line + ':' + error.char );
	}

	if ( pos.length < pad ) {
		pos = pos.bold + ' '.repeat( pad - pos.length );
	} else {
		pos = pos.bold;
	}

	grunt.log.writeln( pos + ' ' + error.text );

};

module.exports.file = ( file, grunt ) => {
	grunt.log.writeln( file.bold.underline );
};

module.exports.total = ( errors, grunt ) => {
	if ( ! errors || ! errors.length ) {
		return grunt.log.oklns( 'No errors found.' );
	}

	let word = grunt.util.pluralize( errors.length, 'error/errors' );
	grunt.log.errorlns( errors.length + ' ' + word + ' found!' );
	grunt.log.writeln();
};
