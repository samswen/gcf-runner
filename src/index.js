'use strict';

const axios = require('axios');
const { spawn } = require('child_process');

module.exports = {
    start_gcf_runner,
    stop_gcf_runner,
    add_function,
    run_functions,
};

const functions = {};

function add_function(name, func, type = 'http') {
    if (typeof func === 'function') {
        functions[name] = {func, type};
        return true;
    } else {
        console.error('not function');
        return false;
    }
}

function run_functions(req, res) {
    const name = req.path.substring(1);
    if (name === 'exit') {
        process.kill(process.pid, "SIGINT");
    }
    if (!name) {
        const names = [];
        for (let name in functions) {
            names.push(name);
        }
        res.status(200);
        res.send(names);
        return;
    }
    const fn = functions[name];
    if (!fn) {
        res.status(400);
        res.send('function ' + name + ' not found');
        return;
    }
    req.url = req.url.replace(req.path, '');
    if (fn.type === 'http') {
        try {
            return fn.func(req, res);
        } catch (err) {
            console.error(err);
            res.status(500);
            res.send(err.message);
        }
    } else {
        let data = req.body;
        if (data) {
            if (typeof data === 'object') {
                data = JSON.stringify(data);
            } else if (typeof data !== 'string') {
                data = String(data);
            }
        }
        const event = {data: Buffer.from(data).toString('base64')};
        try {
            const result = fn.func(event, {});
            res.status(200);
            res.send(result);
        } catch (err) {
            console.error(err);
            res.status(500);
            res.send(err.message);
        }
    }
 }

 function start_gcf_runner(source = './test/gcf-runner.js') {
    return new Promise((resolve, reject) => {
        const npx = spawn('npx', ['@google-cloud/functions-framework', '--source=' + source, '--target=run_functions']);
        npx.stdout.on('data', (data) => {
            const str = data.toString();
            if (str.startsWith('Serving function')) {
                resolve(true);
            }
        });
        npx.stderr.on('data', (data) => {
            console.error(data);
            reject(data);
        });
    });
}

async function stop_gcf_runner() {
    try { 
        await axios.get('http://localhost:8080/exit'); 
    } catch(err) { 
        //
    }
}