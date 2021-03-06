export type PlayerServerRequestType = "ping" | "register" | "unregister" | "statusChange"
export type ClientServerRequestType = "players" | "subscribe" | "playerStatus" | "unsubscribe" | "subscriptionStatus" | "subscriptions" | "queueUp" | "statusChange" | "tokenTransfer" | "serviceToken"

export type PlayerServerResponseType = "pong" | "register" | "statusChange" | "tokenTransfer"
export type ClientServerResponseType = "subscription" | "players" | "subscriptions" | "playerStatus"

export interface PlayerServerRequest {
    type: PlayerServerRequestType;
    payload?: any;
}
export interface ClientServerRequest {
    type: ClientServerRequestType;
    payload?: any;
}

export interface PlayerServerResponse {
    type: PlayerServerResponseType;
    payload?: any;
}
export interface ClientServerResponse {
    type: ClientServerResponseType;
    payload?: any;
}