"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var os_1 = require("os");
var win = null;
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 600,
        height: 400,
        frame: true
    });
    win.loadFile("src/app/index.html");
}
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', function () {
    if (os_1.platform() != "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', createWindow);
