/* eslint-disable no-undef */
'use strict';

const axios = require('axios');
const { start_gcf_runner, stop_gcf_runner } = require('../src');

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

describe('test gcf-runner', () => {

    before(async () => {
        await start_gcf_runner()
    });

    it('verifies it should have the two functions', async () => {

        const response = await axios.get('http://localhost:8080');
        //console.log(response.data);
        assert.isNotNull(response.data);
        expect(response.data).is.an('object');
        expect(Object.keys(response.data).length).equals(2);
        expect(JSON.stringify(response.data)).equals('{"helloWorld":"http","helloEvent":"event"}');

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
        await stop_gcf_runner();
    })
});
