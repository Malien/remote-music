export type PlayerServerRequestType = "ping" | "register" | "unregister" | "statusChange"
export type ClientServerRequestType = "players" | "subscribe" | "playerStatus" | "unsubscribe" | "subscriptionStatus" | "subscriptions" | "queueUp"

export type PlayerServerResponseType = "pong" | "register" | "statusChange"
export type ClientServerResponseType = "subscription" | "players" | "subscriptions" | "playerStatus"

export interface PlayerServerRequest {
    type: PlayerServerRequestType;
    payload?: any;
}
export interface ClientServerRequest {
    type: ClientServerRequestType;
    payload?: any;
}

export interface PlayerServerRespnse {
    type: PlayerServerResponseType;
    payload?: any;
}
export interface ClientServerResponse {
    type: ClientServerResponseType;
    payload?: any;
}