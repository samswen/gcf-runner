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
    if (typeof func !== 'function') {
        console.error('not function');
        return false;
    }
    if (type !== 'http' && type !== 'event') {
        console.error('unknown type ' + type);
        return false;
    }
    functions[name] = {func, type};
    return true;
}

function run_functions(req, res) {
    const name = req.path.substring(1);
    if (name === 'exit') {
        process.kill(process.pid, "SIGINT");
    }
    if (!name) {
        const names = {};
        for (let name in functions) {
            const fn = functions[name];
            names[name] = fn.type;
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
    const env = Object.create(process.env);
    if (!env.stage_env) {
        env.stage_env = 'test';
    }
    return new Promise((resolve, reject) => {
        let resolved = false;
        const npx = spawn('npx', 
            ['@google-cloud/functions-framework', '--source=' + source, '--target=run_functions'],
            { env });
        npx.stdout.on('data', (data) => {
            const str = data.toString();
            if (!resolved && str.startsWith('Serving function')) {
                resolve(true);
                resolved = true;
            }
            console.log('*** gcf-runner --->');
            console.log(str);
            console.log('<--- gcf-runner ***');
        });
        npx.stderr.on('data', (data) => {
            const str = data.toString();
            console.error('*** gcf-runner error --->');
            console.error(str);
            console.error('<--- gcf-runner error ***');
            if (!resolved) {
                reject(str);
                resolved = true;
            }
        });
    });
}

async function send_exit_to_stop() {
    try { 
        await axios.get('http://localhost:8080/exit'); 
    } catch(err) { 
        //
    }
}

function stop_gcf_runner(delay_in_seconds = 0) {
    return new Promise(resolve => {
        setTimeout(() => {
            send_exit_to_stop().then(() => {
                resolve(true);
            });
        }, delay_in_seconds * 1000);
    });
}