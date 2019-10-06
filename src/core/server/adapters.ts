import { Song, PlayerStatus, PlayerStatusChange, Sender } from "../../shared/components"

export interface PlayerServerAdapter {
    on(event: "pong",                       listener: (sender: Sender, status: PlayerStatus) => void): this;
    on(event: "heartbeat",                  listener: (sender: Sender, status: PlayerStatus) => void): this;
    on(event: "register",                   listener: (sender: Sender, name: string) => void): this;
    on(event: "unregister",                 listener: (sender: Sender) => void): this;
    on(event: "statusChange",               listener: (sender: Sender, statusChange: PlayerStatusChange) => void): this;
    on(event: "close",                      listener: (sender: Sender) => void): this;
    on(event: string | symbol,              listener: (...args: any[]) => void): this;

    off(event: "pong",                      listener: (sender: Sender, status: PlayerStatus) => void): this;
    off(event: "heartbeat",                 listener: (sender: Sender, status: PlayerStatus) => void): this;
    off(event: "register",                  listener: (sender: Sender, name: string) => void): this;
    off(event: "unregister",                listener: (sender: Sender) => void): this;
    off(event: "statusChange",              listener: (sender: Sender, statusChange: PlayerStatusChange) => void): this;
    off(event: "close",                     listener: (sender: Sender) => void): this;
    off(event: string | symbol,             listener: (...args: any[]) => void): this;

    addListener(event: "pong",              listener: (sender: Sender, status: PlayerStatus) => void): this;
    addListener(event: "heartbeat",         listener: (sender: Sender, status: PlayerStatus) => void): this;
    addListener(event: "register",          listener: (sender: Sender, name: string) => void): this;
    addListener(event: "unregister",        listener: (sender: Sender) => void): this;
    addListener(event: "statusChange",      listener: (sender: Sender, statusChange: PlayerStatusChange) => void): this;
    addListener(event: "close",             listener: (sender: Sender) => void): this;
    addListener(event: string | symbol,     listener: (...args: any[]) => void): this;

    removeListener(event: "pong",           listener: (sender: Sender, status: PlayerStatus) => void): this;
    removeListener(event: "heartbeat",      listener: (sender: Sender, status: PlayerStatus) => void): this;
    removeListener(event: "register",       listener: (name: string, connection: Sender) => void): this;
    removeListener(event: "unregister",     listener: (sender: Sender) => void): this;
    removeListener(event: "statusChange",   listener: (sender: Sender, statusChange: PlayerStatusChange) => void): this;
    removeListener(event: "close",          listener: (sender: Sender) => void): this;
    removeListener(event: string | symbol,  listener: (...args: any[]) => void): this;

    emit(event: "pong",                     sender: Sender, status: PlayerStatus): boolean;
    emit(event: "heartbeat",                sender: Sender, status: PlayerStatus): boolean;
    emit(event: "register",                 sender: Sender, name: string): boolean;
    emit(event: "unregister",               sender: Sender): boolean;
    emit(event: "statusChange",             sender: Sender, statusChange: PlayerStatusChange): boolean;
    emit(event: "close",                    sender: Sender): boolean;
    emit(event: string | symbol,         ...args: any[]): boolean;
}

export interface ClientServerAdapter {
    on(event: "players",                    listener: (sender: Sender) => void): this;
    on(event: "playerStatus",               listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    on(event: "statusChange",               listener: (id: string, statusChange: PlayerStatusChange) => void): this;
    on(event: "queueUp",                    listener: (id: string, position: number, queue: Song[]) => void): this;
    on(event: "serviceToken",               listener: (service: string, token: string) => void): this;
    on(event: "tokenTransfer",              listener: (service: string, ids: string[]) => void): this;
    on(event: string | symbol,              listener: (...args: any[]) => void): this;
    
    off(event: "players",                   listener: (sender: Sender) => void): this;
    off(event: "playerStatus",              listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    off(event: "statusChange",              listener: (id: string, statusChange: PlayerStatusChange) => void): this;
    off(event: "queueUp",                   listener: (id: string, position: number, queue: Song[]) => void): this;
    off(event: "serviceToken",              listener: (service: string, token: string) => void): this;
    off(event: "tokenTransfer",             listener: (service: string, ids: string[]) => void): this;
    off(event: string | symbol,             listener: (...args: any[]) => void): this;
    
    addListener(event: "players",           listener: (sender: Sender) => void): this;
    addListener(event: "playerStatus",      listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    addListener(event: "statusChange",      listener: (id: string, statusChange: PlayerStatusChange) => void): this;
    addListener(event: "queueUp",           listener: (id: string, position: number, queue: Song[]) => void): this;
    addListener(event: "serviceToken",      listener: (service: string, token: string) => void): this;
    addListener(event: "tokenTransfer",     listener: (service: string, ids: string[]) => void): this;
    addListener(event: string | symbol,     listener: (...args: any[]) => void): this;
    
    removeListener(event: "players",        listener: (sender: Sender) => void): this;
    removeListener(event: "playerStatus",   listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    removeListener(event: "statusChange",   listener: (id: string, statusChange: PlayerStatusChange) => void): this;
    removeListener(event: "queueUp",        listener: (id: string, position: number, queue: Song[]) => void): this;
    removeListener(event: "serviceToken",   listener: (service: string, token: string) => void): this;
    removeListener(event: "tokenTransfer",  listener: (service: string, ids: string[]) => void): this;
    removeListener(event: string | symbol,  listener: (...args: any[]) => void): this;
    
    emit(event: "players",                  sender: Sender): boolean;
    emit(event: "playerStatus",             id: string, sender: Sender, queueLimit?: number): boolean;
    emit(event: "statusChange",             id: string, statusChange: PlayerStatusChange): boolean;
    emit(event: "queueUp",                  id: string, position: number, queue: Song[]): boolean;
    emit(event: "serviceToken",             listener: (service: string, token: string) => void): this;
    emit(event: "tokenTransfer",            listener: (service: string, ids: string[]) => void): this;
    emit(event: string | symbol,         ...args: any): boolean;
}

export interface StreamingClientServerAdapter extends ClientServerAdapter {
    on(event: "players",                        listener: (sender: Sender) => void): this;
    on(event: "playerStatus",                   listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    on(event: "statusChange",                   listener: (id: string, statusChange: PlayerStatusChange) => void): this;
    on(event: "queueUp",                        listener: (id: string, position: number, queue: Song[]) => void): this;
    on(event: "subscribe",                      listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    on(event: "unsubscribe",                    listener: (id: string, sender: Sender) => void): this;
    on(event: "subscriptionStatus",             listener: (id: string, sender: Sender) => void): this;
    on(event: "subscriptions",                  listener: (sender: Sender) => void): this;
    on(evnet: "close",                          listener: (sender: Sender) => void): this;
    on(event: "serviceToken",                   listener: (service: string, token: string) => void): this;
    on(event: "tokenTransfer",                  listener: (service: string, ids: string[]) => void): this;
    on(event: string | symbol,                  listener: (...args: any[]) => void): this;
    
    off(event: "players",                       listener: (sender: Sender) => void): this;
    off(event: "playerStatus",                  listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    off(event: "statusChange",                  listener: (id: string, statusChange: PlayerStatusChange) => void): this;
    off(event: "queueUp",                       listener: (id: string, position: number, queue: Song[]) => void): this;
    off(event: "subscribe",                     listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    off(event: "unsubscribe",                   listener: (id: string, sender: Sender) => void): this;
    off(event: "subscriptionStatus",            listener: (id: string, sender: Sender) => void): this;
    off(event: "subscriptions",                 listener: (sender: Sender) => void): this;
    off(evnet: "close",                         listener: (sender: Sender) => void): this;
    off(event: "serviceToken",                  listener: (service: string, token: string) => void): this;
    off(event: "tokenTransfer",                 listener: (service: string, ids: string[]) => void): this;
    off(event: string | symbol,                 listener: (...args: any[]) => void): this;
    
    addListener(event: "players",               listener: (sender: Sender) => void): this;
    addListener(event: "playerStatus",          listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    addListener(event: "statusChange",          listener: (id: string, statusChange: PlayerStatusChange) => void): this;
    addListener(event: "queueUp",               listener: (id: string, position: number, queue: Song[]) => void): this;
    addListener(event: "subscribe",             listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    addListener(event: "unsubscribe",           listener: (id: string, sender: Sender) => void): this;
    addListener(event: "subscriptionStatus",    listener: (id: string, sender: Sender) => void): this;
    addListener(event: "subscriptions",         listener: (sender: Sender) => void): this;
    addListener(evnet: "close",                 listener: (sender: Sender) => void): this;
    addListener(event: "serviceToken",          listener: (service: string, token: string) => void): this;
    addListener(event: "tokenTransfer",         listener: (service: string, ids: string[]) => void): this;
    addListener(event: string | symbol,         listener: (...args: any[]) => void): this;
    
    removeListener(event: "players",            listener: (sender: Sender) => void): this;
    removeListener(event: "playerStatus",       listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    removeListener(event: "statusChange",       listener: (id: string, statusChange: PlayerStatusChange) => void): this;
    removeListener(event: "queueUp",            listener: (id: string, position: number, queue: Song[]) => void): this;
    removeListener(event: "subscribe",          listener: (id: string, sender: Sender, queueLimit?: number) => void): this;
    removeListener(event: "unsubscribe",        listener: (id: string, sender: Sender) => void): this;
    removeListener(event: "subscriptionStatus", listener: (id: string, sender: Sender) => void): this;
    removeListener(event: "subscriptions",      listener: (sender: Sender) => void): this;
    removeListener(evnet: "close",              listener: (sender: Sender) => void): this;
    removeListener(event: "serviceToken",       listener: (service: string, token: string) => void): this;
    removeListener(event: "tokenTransfer",      listener: (service: string, ids: string[]) => void): this;
    removeListener(event: string | symbol,      listener: (...args: any[]) => void): this;
    
    emit(event: "players",                      sender: Sender): boolean;
    emit(event: "playerStatus",                 id: string, sender: Sender, queueLimit?: number): boolean;
    emit(event: "statusChange",                 id: string, statusChange: PlayerStatusChange): boolean;
    emit(event: "queueUp",                      id: string, position: number, queue: Song[]): boolean;
    emit(event: "subscribe",                    id: string, sender: Sender, queueLimit?: number): boolean;
    emit(event: "unsubscribe",                  id: string, sender: Sender): boolean;
    emit(event: "subscriptionStatus",           id: string, sender: Sender): boolean;
    emit(event: "subscriptions",                sender: Sender): boolean;
    emit(event: "close",                        sender: Sender): boolean;
    emit(event: "serviceToken",                 listener: (service: string, token: string) => void): this;
    emit(event: "tokenTransfer",                listener: (service: string, ids: string[]) => void): this;
    emit(event: string | symbol,             ...args: any): boolean;
}