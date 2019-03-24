import { BrowserWindow, app } from 'electron';
import { platform } from 'os';
let fs = require('fs');

var preferencePath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME + "/.local/share")
preferencePath += "/remote-music-preference.json"

let requireSetup = fs.existsSync(preferencePath)

let win: BrowserWindow = null

function createWindow(){
    win = new BrowserWindow({
        width: 600,
        height: 400,
        frame: true
    })

    win.loadFile("src/app/index.html");
}

app.on('ready', (launchParams) => {
    if (requireSetup) {
        //Show setup window first
    }
    createWindow();
});

app.on('window-all-closed', () =>{
    if (platform() != "darwin"){
        app.quit();
    }
})

app.on('activate', createWindow)