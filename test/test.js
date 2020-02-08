/* eslint-disable no-undef */
'use strict';

const axios = require('axios');
const { start_gcf_runner, stop_gcf_runner } = require('../src');
const { publish_to_topic } = require('@samwen/gcp-utils');

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

describe('test gcf-runner', () => {

    before(async () => {
        await start_gcf_runner()
    });
    
    it('verifies it should have the 4 functions with type', async () => {

        const response = await axios.get('http://localhost:8080');
        console.log(response.data);
        assert.isNotNull(response.data);
        expect(response.data).is.an('object');
        expect(Object.keys(response.data).length).equals(4);
        expect(JSON.stringify(response.data)).equals('{"helloWorld":"http","helloEvent":"event","watch_topic_event":"event","watch_http_api_url":"http"}');

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

    it('verifies publish to topic watch_topic_event should respone OK', async () => {

        const response = await publish_to_topic(null, 'http://localhost:8080/watch_topic_event', {test: 'call watch_topic_even'});
        //console.log(response.data);
        assert.isNotNull(response.data);
        expect(response.data).equals('OK')

    });
    
    it('verifies get call watch_http_api_url it should response OK', async () => {

        const response = await axios.get('http://localhost:8080/watch_http_api_url');
        //console.log(response);
        assert.isNotNull(response.data);
        expect(response.data).equals('OK')

    });

    it('verifies post call watch_http_api_url it should response OK', async () => {

        const response = await axios.post('http://localhost:8080/watch_http_api_url?q=test', {test: 'watch_http_api_url'});
        //console.log(response.data);
        assert.isNotNull(response);
        expect(response.data).equals('OK')

    });

    after(async ()=> {
        await stop_gcf_runner();
    })
});
