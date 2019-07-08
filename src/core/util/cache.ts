import { ObservableMap } from "./observable"
import { EventEmitter } from "events"

interface ExistentialContainer<T> {
    value: T
    invalidationToken: number
}

//Implemetation of active cache (one that proactively tells you when data is expired)
export class Cache<T> {
    private map = new ObservableMap<ExistentialContainer<T>>()
    private invalidationCount: number = 0
    defaultTTL: number
    public get changeEmitter() : EventEmitter { return this.map }

    //FIXME: revert ttl to something more sensible
    constructor(defaultTTL = 10) {
        this.defaultTTL = defaultTTL
    }

    get(key: string):T | undefined {
        return (this.map.get(key) as ExistentialContainer<T>).value
    }
    set(key: string, value: T, ttl = this.defaultTTL):void {
        this.invalidationCount++
        let invalidationToken = this.invalidationCount
        this.map.set(key, { value, invalidationToken })
        setTimeout(()=> {
            this.changeEmitter.emit("pre-invalidation", key)
            let container = this.map.get(key) as ExistentialContainer<T>
            if (container.invalidationToken == invalidationToken) this.invalidate(key)
        }, ttl*1000)
    }
    notify = this.map.commit.bind(this.map)
    invalidate(key: string):void {
        this.map.delete(key)
    }
    has(key: string):boolean {
        return this.map.has(key)
    }
    forEach: (callbackfn: (value: T, key: string, map: Map<string, T>) => void, thisArg?: any)=> void = this.map.forEach.bind(this.map)
    keys: (callbackfn: (value: T, key: string, map: Map<string, T>)=>void)=>void = this.map.keys.bind(this.map)
}
