import { EventEmitter } from "events"
import { ObservableMap } from "./observable"

interface ExistentialContainer<T> {
    value: T;
    invalidationToken: number;
}

//Implemetation of active cache (one that proactively tells you when data is expired)
export class Cache<T> {
    private map = new ObservableMap<ExistentialContainer<T>>()
    private invalidationCount: number = 0
    public defaultTTL: number
    public get changeEmitter(): EventEmitter { return this.map }

    //FIXME: THIS SHIT IS BROKEN ON SO MANY 
    //       LEVELS I CAN'T EVEN IMAGINE
    public constructor(defaultTTL = 50) {
        this.defaultTTL = defaultTTL
    }

    public get(key: string): T | undefined {
        let v = this.map.get(key)
        return (v ? v.value : undefined)
    }
    public set(key: string, value: T, ttl = this.defaultTTL): void {
        this.invalidationCount++
        let invalidationToken = this.invalidationCount
        this.map.set(key, { value, invalidationToken })
        setTimeout(()=> {
            this.changeEmitter.emit("pre-invalidation", key)
            let container = this.map.get(key)
            if (container && container.invalidationToken == invalidationToken) this.invalidate(key)
        }, ttl*1000)
    }
    public notify = this.map.commit.bind(this.map)
    public invalidate(key: string): void {
        this.map.delete(key)
    }
    public has(key: string): boolean {
        return this.map.has(key)
    }
    public forEach(callbackfn: (value: T, key: string) => void) {
        this.map.forEach((val, key) => {
            callbackfn(val.value, key)
        })
    }
    public get size() {
        return this.map.size
    }
    public keys: () => IterableIterator<string> = this.map.keys.bind(this.map)
}
