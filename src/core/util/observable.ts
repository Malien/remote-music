import { EventEmitter } from "events"

interface Observable<V> {
    on(event: "change", listener: ()=>void):this
    on(event: string, listener: (value: V)=>void):this
}

export class ObservableMap<V> extends EventEmitter implements Observable<V>, Map<string, V> {
    protected map = new Map<string, V>()
    public get(key: string): V {
        return this.map[key]
    }
    public set(key: string, value: V) {
        this.map[key] = value
        this.emit(key, value)
        this.emit("change")
        return this
    }
    public commit(key: string) {
        this.emit(key, this.map[key]);
        this.emit("change")
    }
    public valueOf = function(): Map<string, V> {
        return this.map
    }
    public clear(): void {
        for (let key in this.map.keys()) {
           this.emit(key, null)
        }
        this.map.clear()
    }
    public delete(key: string): boolean {
        let res = this.map.delete(key)
        if (res) this.emit(key, null)
        return res
    }
    public forEach = this.map.forEach
    public has = this.map.has
    public get size(): number { return this.map.size }
    public [Symbol.iterator] = this.map.entries
    public entries = this.map.entries
    public keys = this.map.keys
    public values = this.map.values;
    public get [Symbol.toStringTag]() {
        return this.map.toString()
    }
}
