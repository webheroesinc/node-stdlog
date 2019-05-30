
const { createLogger, format, transports }	= require('winston');
const { combine, timestamp, label, printf }	= format;
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
	formatter,
	streams
    } = {}
) {

    logLevelNames				= Object.keys( defaultLevels );

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
	    new transports.Console({
		stderrLevels: logLevelNames,
	    }),
	];
    }

    streams.map(function( transport ) {
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
	format:		combine( label({ label: name }), timestamp(), formatter ),
	transports:	streams,
    });

    function wrapMethod(level, method) {
	return function() {
	    const args				= [...arguments].map( arg => String(arg) );
	    return method( sprintf.apply(sprintf, args) );
	}
    }

    for (let level of logLevelNames) {
	logger[level] = wrapMethod( level, logger[level] );
    }
    
    return logger;
    
};
