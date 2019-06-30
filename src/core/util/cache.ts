import { ObservableMap } from "./observable"
import { EventEmitter } from "events"

interface ExistentialContainer<T> {
    value: T
    invalidationToken: number
}

//Implemetation of active cache (one that proactively tells you when data is expired)
export class Cache<T> {
    private map = new ObservableMap<ExistentialContainer<T>>()
    private updateRate: number
    private invalidationCount: number = 0
    defaultTTL: number
    public get changeEmitter() : EventEmitter { return this.map }

    constructor(defaultTTL = 500, updateRate = 10) {
        this.defaultTTL = defaultTTL
        this.updateRate = updateRate
    }

    get(key: string):T{
        return this.map.get(key).value
    }
    set(key: string, value: T, ttl = this.defaultTTL):void {
        this.invalidationCount++
        let invalidationToken = this.invalidationCount
        this.map.set(key, { value, invalidationToken })
        setTimeout(()=> {
            let container = this.map.get(key)
            if (container.invalidationToken == invalidationToken) this.invalidate(key)
        }, ttl*1000)
    }
    invalidate(key: string):void {
        this.map.delete(key)
    }
    has(key: string):boolean {
        return this.map.has(key)
    }
}
