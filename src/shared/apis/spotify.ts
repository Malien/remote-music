/* eslint-disable @typescript-eslint/camelcase */
import request from "request-promise-native"
import { BrowserWindow } from "electron"
import { doneServing, servePage, redirectURI } from "./confirmation"
import url from "url"

import Keys from "../../core/keys"
import { AuthTokensBundle } from "../components"

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

interface AuthTokenRequest {
    grant_type: string;
    code: string;
    redirect_uri: string;
    client_id?: string;
    client_secret?: string;
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
export async function callbackListener(res: AuthCodeResponse) {
    doneServing()
    let authWin = openAuthWindows[res.state]
    if (authWin) {
        authWin.close()
        delete openAuthWindows[res.state]
    }

    console.log(res)
    
    if (res.error) {
        console.error(`Spotify: ${res.error}`)
    } else if (res.code) {
        let req: AuthTokenRequest = {
            grant_type: "authorization_code",
            code: res.code,
            redirect_uri: redirectURI,
            client_id: spotifyID,
            client_secret: await Keys.spotify()
        }
        request.post("https://accounts.spotify.com/api/token", {form: req})
            .then(res => {
                console.log(res)
            }, rej => {
                console.error(rej)
            }).catch(console.error)
    }
}

export async function authorize(scopes: Scopes[]): Promise<AuthTokensBundle> {
    return new Promise<AuthTokensBundle>((resolve, reject) => {
        servePage()
        let req: AuthRequest = {
            clientId: spotifyID,
            responseType: "code",
            redirectUri: redirectURI,
            state: String(authCount++),
            scope: scopes
        }
        let queryString = authorizeURL(req)
        let authWin = new BrowserWindow({
            width: 400,
            height: 600,
            resizable: true,
            title: "Spotify authorization",
            webPreferences: {
                nodeIntegration: true, 
                enableRemoteModule: false,
                sandbox: true
            }
        })
        authWin.webContents.on("will-redirect", async (event, to) => {
            let params: AuthCodeResponse = url.parse(to, true).query as any
            doneServing()
            
            if (params.error) {
                reject(`Spotify: ${params.error}`)
            } else if (params.code) {
                let req: AuthTokenRequest = {
                    grant_type: "authorization_code",
                    code: params.code,
                    redirect_uri: redirectURI,
                    client_id: spotifyID,
                    client_secret: await Keys.spotify()
                }
                request.post("https://accounts.spotify.com/api/token", {form: req})
                    .then(res => {
                        resolve(res)
                    }, reject).catch(reject)
            }
            authWin.close()
        })
        authWin.loadURL(queryString)
        authWin.webContents.on("dom-ready", () => authWin.show())
    })
}