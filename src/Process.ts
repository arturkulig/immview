import {
    Observable
} from './Observable'
import {
    OpStream,
    Stream,
    Observer,
    Subscription,
} from './Types'

export class Process<T, U = void> implements Observer<T>, PromiseLike<U> {
    messageBox: Observable<T>
    closed: boolean
    end: Promise<U>
    sub: Subscription

    constructor(task: (messageBox: OpStream<T>) => U) {
        this.messageBox = new Observable<T>()
        this.closed = false
        this.end = new Promise(async resolve => {
            const result = await task.call(undefined, this.messageBox)
            this.closed = true
            if (this.sub && !this.sub.closed) {
                this.sub.unsubscribe()
            }
            if (!this.messageBox.closed) {
                this.messageBox.subscribe(() => { }).unsubscribe()
                this.messageBox.complete()
            }
            resolve(result)
        })
    }
    start(sub: Subscription) {
        this.sub = sub
    }
    next(value: T) {
        this.messageBox.next(value)
    }
    error(value: Error) {
        this.messageBox.error(value)
    }
    complete() {
        this.messageBox.complete()
    }
    then<TResult1 = U, TResult2 = never>(onfulfilled?: ((value: U) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> {
        return this.end.then(onfulfilled, onrejected)
    }
}
