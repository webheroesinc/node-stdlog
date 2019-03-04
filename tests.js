
const stdlog				= require('./main.js');
const log				= stdlog('test.js', {
    level: 'warn',
});

log.warn('I am a warning log');
log.info('I am a info log that should be hidden');
