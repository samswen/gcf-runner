'use strict';

const axios = require('axios');
const { spawn } = require('child_process');

module.exports = {
    start_gcf_runner,
    stop_gcf_runner,
    add_function,
    run_functions,
    watch_topic_event,
    watch_http_api_url,
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
        return run_http_function(name, fn.func, req, res);
    } else {
        return run_event_function(name, fn.func, req, res);
    }
}

function run_http_function(name, func, req, res) {
    process.stdout.write('>> ' + name + ' starting ...\n');
    try {
        const ret = func(req, res);
        if (ret.then && typeof ret.then === 'function') {
            ret.then((result) => {
                process.stdout.write('<< ' + name + ' finished\n');
                return 'OK';
            }).catch((err) => {
                process.stdout.write('<< ' + name + ' finished with exception\n');
                console.error(err);
                return 'error';
            })
        } else {
            process.stdout.write('<< ' + name + ' finished\n');
            return 'OK';
        }
    } catch (err) {
        process.stdout.write('<< ' + name + ' finished with exception\n');
        console.error(err);
        return 'error';
    }
}

function run_event_function(name, func, req, res) {
    let data = req.body;
    if (data) {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        } else if (typeof data !== 'string') {
            data = String(data);
        }
    }
    const event = {data: Buffer.from(data).toString('base64')};
    process.stdout.write('>> ' + name + ' starting ...\n');
    try {
        const ret = func(event, {});
        if (ret.then && typeof ret.then === 'function') {
            ret.then((result) => {
                process.stdout.write('<< ' + name + ' finished\n');
                res.status(200);
                res.send(result);
                return 'OK';
            }).catch((err) => {
                process.stdout.write('<< ' + name + ' finished with error\n');
                console.error(err);
                res.status(500);
                res.send(err.message);
                return 'error';
            })
        } else {
            process.stdout.write('<< ' + name + ' finished\n');
            res.status(200);
            res.send(ret);
            return 'OK';
        }
    } catch (err) {
        process.stdout.write('<< ' + name + ' finished with exception\n');
        console.error(err);
        res.status(500);
        res.send(err.message);
        return 'error';
    }
}

function start_gcf_runner(source = './test/gcf-runner.js') {
    const env = Object.create(process.env);
    if (!env.stage_env) {
        env.stage_env = 'test';
    }
    return new Promise((resolve, reject) => {
        send_exit_to_stop().then(() => { // to release the listenning port, in case it is still opened
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
                process.stdout.write(str);
            });
            npx.stderr.on('data', (data) => {
                const str = data.toString();
                process.stderr.write('error: ' + str);
                if (!resolved) {
                    reject(str);
                    resolved = true;
                }
            });
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

async function watch_topic_event(pubSubEvent, context) {
    const data = Buffer.from(pubSubEvent.data, 'base64').toString();
    const event = JSON.parse(data);
    console.log(event);
    return 'OK';
}

async function watch_http_api_url(req, res) {
    console.log('method: ' + req.method);
    console.log('headers: ', req.headers);
    if (req.query && Object.keys(req.query).length > 0) {
        console.log('query: ', req.query);
    }
    if (req.body) {
        if (typeof req.body === 'string') {
            console.log('body: ' + req.body);
        } else if (Object.keys(req.body).length > 0) {
            console.log('body: ', req.body);
        }
    }
    res.status(200);
    res.send('OK');
    return 'OK';
}
