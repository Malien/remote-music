import { BrowserWindow, app } from 'electron';
import { platform } from 'os';

let win: BrowserWindow = null

function createWindow(){
    win = new BrowserWindow({
        width: 600,
        height: 400
    });

    win.loadFile("src/app/index.html");
}

app.on('ready', createWindow);

app.on('window-all-closed', () =>{
    if (platform() != "darwin"){
        app.quit();
    }
});

app.on('activate', createWindow)