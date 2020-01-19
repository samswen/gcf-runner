# gcf-runner

use google functions framework to run multiple cloud functions locally for development and test.

# how to install

npm install gcf-runner

# how to use

1) install google functions framework

   npm install @google-cloud/functions-framework

2) functions.js 
<pre>
exports.helloWorld = (req, res) => {
  console.log('call helloWorld');
  res.send('Hello, World');
};

exports.helloEvent = (event, context) => {
    console.log('call helloEvent');
    return Buffer.from(event.data, 'base64').toString();
}
</pre>

3) gcf-runner.js
<pre>
const { add_function, run_functions } = require('../src');
const { helloWorld, helloEvent } = require('./functions');

module.exports = {
    run_functions
};

add_function('helloWorld', helloWorld, 'http');
add_function('helloEvent', helloEvent, 'event');
</pre>

4) run google functions framework

   npx @google-cloud/functions-framework --source=gcf-runner.js --target=run_functions