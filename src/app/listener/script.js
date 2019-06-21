const ipcRenderer = require("electron").ipcRenderer;

ipcRenderer.on("test", (sender, data) => {
    let node = document.createTextNode(data.toString());
    document.body.appendChild(node);
})

window.onload = () => {
}