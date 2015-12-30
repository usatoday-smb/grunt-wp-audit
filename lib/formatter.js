/**
 * Output formatter.
 */
'use strict';

module.exports = ( error, grunt ) => {

	let pos;
	if ( error.line && error.char ) {
		pos = ( error.line + ':' + error.char ).bold;
	} else {
		pos = "\t";
	}

	grunt.log.writeln( pos + "\t" + error.text );

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
