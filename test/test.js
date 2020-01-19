/* eslint-disable no-undef */
'use strict';

const axios = require('axios');
const spawn = require('child_process').spawn;

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

describe('test gcf-runner', () => {

    before(async () => {
        const npx = spawn('npx', ['@google-cloud/functions-framework', '--source=./test/gcf-runner.js', '--target=run_functions']);
        await sleep(500);
    });

    it('verifies it should have the two functions', async () => {

        const response = await axios.get('http://localhost:8080');
        //console.log(response.data);
        assert.isNotNull(response.data);
        expect(response.data).is.an('array');
        expect(response.data.length).equals(2);
        expect(JSON.stringify(response.data)).equals('["helloWorld","helloEvent"]');

    });

    it('verifies call helloWorld it should return Hello, World', async () => {

        const response = await axios.get('http://localhost:8080/helloWorld');
        //console.log(response.data);
        assert.isNotNull(response.data);
        expect(response.data).equals('Hello, World');

    });

    it('verifies call helloEvent it should return {"Hello":"Event"}', async () => {

        const response = await axios.post('http://localhost:8080/helloEvent', {Hello: 'Event'});
        //console.log(response.data);
        assert.isNotNull(response.data);
        expect(JSON.stringify(response.data)).equals('{"Hello":"Event"}');

    });

    after(async ()=> {
        try { await axios.get('http://localhost:8080/exit'); } catch(err) { }
    })
});

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}   