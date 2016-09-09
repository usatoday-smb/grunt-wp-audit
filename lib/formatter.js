/**
 * Output formatter.
 */
'use strict';

const pad = 8;
const grunt = require( 'grunt' );

module.exports = error => {

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

module.exports.file = file => {
	grunt.log.writeln( file.bold.underline );
};

module.exports.total = errors => {
	if ( Array.isArray( errors ) ) {
		errors = errors.length;
	}

	if ( 0 !== errors ) {
		let word = grunt.util.pluralize( errors, 'error/errors' );
		grunt.log.errorlns( errors + ' ' + word + ' found!' );
	} else {
		grunt.log.oklns( 'No errors found.' );
	}
	grunt.log.writeln();
};

module.exports.checked = files => {
	if ( Array.isArray( files ) ) {
		files = files.length;
	}

	let count = grunt.util.pluralize( files, 'file/files' );
	grunt.log.ok( files + ' ' + count + ' checked.' );
}

module.exports.errors = errors => {
	if ( errors ) {
		let word = grunt.util.pluralize( errors, 'error/errors' );
		grunt.fail.warn( errors + ' total ' + word + ' found!' );
	}
}
