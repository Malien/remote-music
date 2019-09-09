import request from "request-promise-native"
import { BrowserWindow } from "electron"

const spotifyID = "549b0471f277418683dddd8220e2672c"

export interface AuthRequest {
    clientId: string;
    responseType: string;
    redirectUri: string;
    state?: string;
    scope?: Scopes[];
    showDialog?: boolean;
}

export interface AuthCodeResponse {
    code?: string;
    error?: string;
    state: string;
}

export enum Scopes {
    playlistReadCollaborative = "playlist-read-collaborative",
    playlistModifyPrivate = "playlist-modify-private",
    playlistModifyPublic = "playlist-modify-public",
    playlistReadPrivate = "playlist-read-private",
    //Spotify Connect
    userModifyPlaybackState = "user-modify-playback-state",
    userReadCurrentlyPlaying = "user-read-currently-playing",
    userReadPlaybackState = "user-read-playback-state",
    //Users
    userReadPrivate = "user-read-private",
    userReadEmail = "user-read-email",
    //Library
    userLibraryModify = "user-library-modify",
    userLibraryRead = "user-library-read",
    //Follow
    userFollowModify = "user-follow-modify",
    userFollowRead = "user-follow-read",
    //Listening History
    userReadRecentlyPlayed = "user-read-recently-played",
    userTopRead = "user-top-read",
    //Playeback
    streaming = "streaming",
    appRemoteControl = "app-remote-control" //Only iOS and Android
}

export function authorizeURL({clientId, responseType, redirectUri, state, scope, showDialog}: AuthRequest) {
    return `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(redirectUri)}${state ? `&state=${state}` : ""}${scope ? `&scope=${encodeURIComponent(scope.reduce<string>((prev, cur) => prev + " " + cur, ""))}`: ""}${showDialog ? `&show_dialog=${showDialog}` : ""}`
}

let authCount = 0
let openAuthWindows: {[key: string]: BrowserWindow | undefined} = {}
export function authorize(scopes: Scopes[]) {
    let req: AuthRequest = {
        clientId: spotifyID,
        responseType: "code",
        redirectUri: "remote-music://callback/spotify",
        state: String(authCount++),
        scope: scopes
    }
    let queryString = authorizeURL(req)
    let authWin = new BrowserWindow({
        width: 400,
        height: 600,
        resizable: false,
        title: "Spotify authorization",
        webPreferences: {
            nodeIntegration: false, 
            enableRemoteModule: false,
            sandbox: true
        }
    })
    authWin.loadURL(queryString)
    authWin.webContents.on("dom-ready", () => authWin.show())
    authWin[authCount] = authWin
}

export function callbackListener(res: AuthCodeResponse) {
    let authWin = openAuthWindows[res.state]
    if (authWin) authWin.close()
    delete openAuthWindows[res.state]
    
    if (res.error) {
        console.error(`Spotify: ${res.error}`)
    } else if (res.code) {
        //TODO: make post request and process given token
    }
}