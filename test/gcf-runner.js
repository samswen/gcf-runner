const { add_function, run_functions } = require('../src');
const { helloWorld, helloEvent } = require('./functions');

module.exports = {
    run_functions
};

add_function('helloWorld', helloWorld, 'http');
add_function('helloEvent', helloEvent, 'event');