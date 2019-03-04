
const { createLogger, format, transports }	= require('winston');
const { combine, timestamp, label, printf }	= format;

module.exports					= function createLogger( label, formatter, transports ) {

    if ( formatter === undefined ) {
	formatter				= printf(
	    function({ level, message, label, timestamp }) {
		return `${timestamp} [${label}] ${level}: ${message}`;
	    }
	);
    }
    if ( transports === undefined ) {
	transports				= [
	    new transports.Console()
	];
    }
    
    return createLogger({
	format:		combine( label({ label }), timestamp(), formatter ),
	transports,
    });
};
