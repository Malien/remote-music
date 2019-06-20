let updater = require("electron").remote.require("./core/client/updater")

window.onload = () => {
    console.log(updater);
    document.body.appendChild(document.createTextNode("Sup js"))
}
// alert("what's up")