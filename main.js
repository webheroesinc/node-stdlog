
const { createLogger, format, transports }	= require('winston');
const { combine, timestamp, label, printf }	= format; // same as require('logform')
const sprintf					= require('sprintf-js').sprintf;

let defaultLevels				= {
    fatal: 0,
    error: 1,
    warn: 2,
    normal: 3,
    info: 4,
    debug: 5,
    silly: 6,
};
let logLevelNames;

module.exports					= function Logger(
    name,
    {
	level = 'fatal',
	levels = defaultLevels,
	template,
	json_dump = true,
	streams
    } = {}
) {

    logLevelNames				= Object.keys( defaultLevels );

    if ( template === undefined ) {
	// 'logform.printf' has nothing in common with 'printf'.  It is simply a wrapper that calls
	// the given function with the message 'info' object.
	format_template				= printf(
	    function({ level, message, label, timestamp }) {
		// Add prefix to every log message
		if ( Array.isArray(message) ) {
		    args			= message.map(
			v => typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)
		    );
		    message			= sprintf(...args);
		}
		return sprintf('%s [ %-10.10s ] %5.5s: %s', timestamp, label, level.toUpperCase(), message);
	    }
	);
    } else {
	// Set up custom prefix for every log message
	format_template				= printf( template );
    }

    formatter					= combine( label({ label: name }), timestamp(), format_template );
    
    if ( streams === undefined ) {
	// Default stream is to console on stderr
	streams					= [
	    new transports.Console({
		stderrLevels:	logLevelNames,
	    }),
	];
    }

    streams.map(function( transport ) {
	// By adding the formatter to each transport, we will avoid any unnecessary string
	// formatting.  Transports check the log level before calling 'logform.transform'.
	transport.format			= formatter;

	// Add ability to set the log level using a verbosity counter
	transport.setLevel			= function( level ) {
	    if ( level === undefined )
		level				= 0;

	    this.level				= level <= logLevelNames.length
		? logLevelNames[ level ]
		: logLevelNames[ logLevelNames.length-1 ];
	};
    });

    const logger				= createLogger({
	level,
	levels,
	transports:	streams,
    });

    function wrapMethod(level, method) {
	return function() {
	    return method( [...arguments] );
	}
    }

    for (let level of logLevelNames) {
	logger[level] = wrapMethod( level, logger[level] );
    }
    
    return logger;
    
};
