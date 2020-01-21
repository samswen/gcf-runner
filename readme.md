# gcf-runner

use google functions framework to run multiple cloud functions locally for development and test.

## how to install

npm install @samwen/gcf-runner

## how to use

### Step 1) functions.js 
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

### Step 2) gcf-runner.js
keep it the same name for your convenience.
<pre>
const { add_function, run_functions } = require('@samwen/gcf-runner');
const { helloWorld, helloEvent } = require('./functions');

module.exports = {
    run_functions
};

add_function('helloWorld', helloWorld, 'http');
add_function('helloEvent', helloEvent, 'event');
</pre>

### Step 3) test code example
<pre>
const axios = require('axios');
const { start_gcf_runner, stop_gcf_runner } = require('@samwen/gcf-runner');

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

describe('test gcf-runner test example', () => {

    before(async () => {
        await start_gcf_runner()
    });

    it('verifies it should have the two functions', async () => {
        const response = await axios.get('http://localhost:8080');
        expect(JSON.stringify(response.data)).equals('["helloWorld","helloEvent"]');
    });

    it('verifies call helloWorld it should return Hello, World', async () => {
        const response = await axios.get('http://localhost:8080/helloWorld');
        expect(response.data).equals('Hello, World');
    });

    it('verifies call helloEvent it should return {"Hello":"Event"}', async () => {
        const response = await axios.post('http://localhost:8080/helloEvent', {Hello: 'Event'});
        expect(JSON.stringify(response.data)).equals('{"Hello":"Event"}');
    });

    after(async ()=> {
        await stop_gcf_runner();
    })
});
</pre>

### Step 4) optional, run google functions framework
<pre>
npx @google-cloud/functions-framework --source=./test/gcf-runner.js --target=run_functions
</pre>