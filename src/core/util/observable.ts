import { EventEmitter } from "events"

interface Observable<V> {
    on(event: "change", listener: ()=>void):this
    on(event: string, listener: (value: V)=>void):this
}

export class ObservableMap<V> extends EventEmitter implements Observable<V>, Map<string, V> {
    private map = new Map<string, V>()
    public get(key: string): V | undefined {
        return this.map.get(key)
    }
    public set(key: string, value: V) {
        this.map.set(key, value)
        this.emit(key, value)
        this.emit("change", key, value)
        return this
    }
    public commit(key: string) {
        this.emit(key, this.map.get(key))
        this.emit("change", key, this.map.get(key))
    }
    public valueOf(): Map<string, V> {
        return this.map
    }
    public clear(): void {
        for (let key in this.map.keys()) {
           this.emit(key, null)
        }
        this.emit("clear")
        this.map.clear()
    }
    public delete(key: string): boolean {
        let res = this.map.delete(key)
        if (res) {
            this.emit(key, null)
            this.emit("change", key, null)
        }
        return res
    }
    // public forEach: (callbackfn: (value: V, key: string, map: Map<string, V>)=>void)=>void = this.map.forEach.bind(this.map) 
    forEach(callbackfn: (value: V, key: string, map: Map<string, V>)=>void) {
        this.map.forEach((val, key, map) => {
            callbackfn(val, key, map)
        })
    }
    public has: (key: string)=>boolean = this.map.has.bind(this.map)
    public get size(): number { return this.map.size }
    public entries: ()=>IterableIterator<[string, V]> = this.map.entries.bind(this.map)
    public [Symbol.iterator] = this.entries
    public keys: ()=>IterableIterator<string> = this.map.keys.bind(this.map)
    public values: ()=>IterableIterator<V> = this.map.values.bind(this.map)
    public get [Symbol.toStringTag]() {
        return this.map.toString()
    }
}
