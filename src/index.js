
module.exports = {
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