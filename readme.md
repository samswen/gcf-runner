# gcf-runner

use google functions framework to run multiple cloud functions locally for development and test.

# how to install

npm install @samwen/gcf-runner

# how to use

1. install google functions framework

npm install @google-cloud/functions-framework

2. functions.js 
<pre>
exports.helloWorld = (req, res) => {
  console.log('call helloWorld');
  res.send('Hello, World');
};

exports.helloEvent = (event, context) => {
    console.log('call helloEvent');
    const str = Buffer.from(event.data, 'base64').toString();
    const data = JSON.parse(str);
    return data;
}
</pre>

3. test.js
<pre>
const { add_function, run_functions } = require('../src');
const { helloWorld, helloEvent } = require('./functions');

module.exports = {
    run_functions
};

add_function('helloWorld', helloWorld, 'http');
add_function('helloEvent', helloEvent, 'event');
</pre>

4. run google functions framework

npx @google-cloud/functions-framework --source=test.js --target=run_functions