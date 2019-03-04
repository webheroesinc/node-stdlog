
const { createLogger, format, transports }	= require('winston');
const sprintf					= require('sprintf-js').sprintf;
const { combine, timestamp, label, printf }	= format;

module.exports					= function Logger( name, formatter, streams ) {

    if ( formatter === undefined ) {
	formatter				= printf(
	    function({ level, message, label, timestamp }) {
		return sprintf('%s [ %-10.10s ] %5.5s: %s', timestamp, label, level.toUpperCase(), message);
	    }
	);
    } else {
	formatter				= printf( formatter );
    }
    
    if ( streams === undefined ) {
	streams					= [
	    new transports.Console(),
	];
    }

    return createLogger({
	format:		combine( label({ label: name }), timestamp(), formatter ),
	transports:	streams,
    });
    
};
