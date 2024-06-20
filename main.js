const { app, BrowserWindow, screen } = require("electron");
const path = require("path");
const { createServer, checkServer, closeServer } = require("./node-php-server");

const port = 8000;
const host = '127.0.0.1';
const server_url = `http://${host}:${port}`;

const createPhpServer = () => {
    createServer({
        port: port,
        hostname: host,
        base: path.join(__dirname, 'www/public'), // your project path
        keepalive: false,
        open: false,
        bin: path.join(__dirname, '/php/php.exe'), // your php.exe path
        router: path.join(__dirname, '/www/server.php') //your route path server.php
    }).then(() => {
        checkServer(host, port, function (err) {
            if (err) {
                console.error('Error checking server:', err);
            } else {
                console.log(`PHP running on ${host}:${port}`);
            }
        });
    }).catch((err) => {
        console.error('Error creating server:', err);
    });
}

const createWindow = () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const win = new BrowserWindow({
        width: 500,
        height: 500
    });

    win.loadURL(server_url);

    win.on('ready-to-show', () => {
        win.maximize();
        win.show();
    });

    win.on('close', () => {
        closeServer();
    });
}

app.whenReady().then(() => {
    createPhpServer();
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    closeServer();
});
