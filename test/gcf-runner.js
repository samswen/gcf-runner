const { add_function, run_functions, watch_http_api_url, watch_topic_event } = require('../src');
const { helloWorld, helloEvent } = require('./functions');

module.exports = {
    run_functions
};

add_function('helloWorld', helloWorld, 'http');
add_function('helloEvent', helloEvent, 'event');

add_function('watch_topic_event', watch_topic_event, 'event');
add_function('watch_http_api_url', watch_http_api_url, 'http');

