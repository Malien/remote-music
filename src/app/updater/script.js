const updater = require("electron").remote.require("./core/client/updater")

window.onload = () => {
    console.log(updater);
    updater.on("change", console.log);
    updater.on("close", console.log);
    updater.on("error", console.error);
}