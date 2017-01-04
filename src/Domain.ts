import { Observable } from './Observable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch } from './DispatcherInstance'

interface actions {
    [id: string]: () => void
}

export class Domain<T, U extends actions> {
    constructor(
        private stream: Observable<T>,
        private actions?: U
    ) { }

    public dispatch(actionName: keyof U, ...args: any[]): Promise<void> {
        return new Promise<void>(resolve => {
            dispatch(() => {
                try {
                    this.actions[actionName].apply(this, args)
                } catch (e) {
                    console.error(e.stack || e.message || e)
                }
                resolve()
            }, DispatcherPriorities.DOMAIN)
        })
    }

    public read() {
        return this.stream.read()
    }

    public subscribe(listener: (value: T) => void) {
        return this.stream.subscribe()
    }

    public map<U>(processor: (value: T) => U) {
        return this.stream.map<U>(processor)
    }
}
