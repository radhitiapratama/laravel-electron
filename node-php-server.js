var path = require('path'),
    http = require('http'),
    spawn = require('child_process').spawn,
    cp = null,
    checkServerTries = 0;

var extend = function (target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
};

var checkServer = function (hostname, port, cb) {
    setTimeout(function () {
        http.request({
            method: 'HEAD',
            hostname: hostname,
            port: port
        }, function (res) {
            if (res.statusCode === 200 || res.statusCode === 404) {
                return cb();
            }
            checkServer(hostname, port, cb);
        }).on('error', function (err) {
            // back off after 1s
            if (++checkServerTries > 20) {
                console.log(err);
                return cb();
            }
            checkServer(hostname, port, cb);
        }).end();
    }, 50);
};

var createServer = async function (params) {
    'use strict';

    // Dynamic import for ES module 'open'
    const { default: open } = await import('open');

    var defaults = {
        port: 8000,
        router: 'server.php',
        hostname: '127.0.0.1',
        base: '.',
        keepalive: false,
        open: false,
        bin: 'php'
    };

    var options = extend({}, defaults, params);
    var host = options.hostname + ':' + options.port;
    var args = ['-S', host];

    if (options.router) {
        args.push(options.router);
    }

    checkServer(options.hostname, options.port, function () {
        if (!options.keepalive) {
            return;
        }

        if (options.open) {
            open('http://' + host);
        }
    });

    cp = spawn(options.bin, args, {
        cwd: path.resolve(options.base),
        stdio: 'ignore'
    });

    process.on('exit', function () {
        cp.kill();
    });
};

var closeServer = function () {
    if (cp) {
        cp.kill();
    }
};

module.exports = {
    checkServer: checkServer,
    createServer: createServer,
    closeServer: closeServer
};
