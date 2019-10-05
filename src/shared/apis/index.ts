/* eslint-disable no-useless-escape */
import * as Spotify from "./spotify"
export { Services, ServiceAvailability } from "./common"
export { doneServing, servePage } from "./confirmation"
export { Spotify }

//DEPRECATED:
export function handleCallbackUrl(url: string) {
    let match = url.match(/(?<=remote-music:\/\/callback\/).*/)
    if (match && match[0]) {
        let [service, argsstr] = url.split("?")
        let args
        if (argsstr) {
            args = Object.fromEntries(argsstr.split("&").map(str => str.split("=")))
        }
        if (service == "spotify" && args) {
            Spotify.callbackListener(args)
        }
    }
}