import {
    OpStream,
    Observer,
    Subscription,
    Transformer,
    ValueListener,
    ErrorListener,
    CompletionListener,
} from './Types'
import { Atom } from './Atom'
import { Observable } from './Observable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatchAndReturn } from './DispatcherInstance'
import { diagnose } from './Diagnose'

function fillAsyncIterSymbol() {
    (Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol('Symbol.asyncIterator')
}
fillAsyncIterSymbol()

export interface Actions<T> {
    [id: string]: (this: Domain<T>, ...args: any[]) => void | Promise<any>
}

export class Domain<T> implements OpStream<T>, AsyncIterable<T>, PromiseLike<T> {
    name: string

    constructor(
        protected $: OpStream<T>
    ) {
        if (!$) {
            throw new Error('Domain cannot be created without a (Observable/Atom/Domain) source')
        }
    }

    public static create<DomainT, ActionsT extends Actions<DomainT>, FieldsT extends {}>(stream: OpStream<DomainT>, actions: ActionsT, fields?: FieldsT): Domain<DomainT> & ActionsT & FieldsT {
        const instance = (new Domain(stream) as Object)
        instance['name'] = `${(instance as Domain<DomainT>).$.name}\$!`

        if (actions) {
            for (const actionsKey in actions) {
                const currentActionName = actionsKey
                if (!Object.prototype.hasOwnProperty.call(actions, actionsKey)) {
                    continue
                }
                instance[(actionsKey as string)] =
                    (...args) =>
                        dispatchAndReturn(() => {
                            const diagDone = diagnose.measure(`<\$ ${instance['name'] ? `${instance['name']}.` : ''}${currentActionName}`)
                            const result = actions[actionsKey].apply(instance, args)
                            diagDone && diagDone()
                            return result
                        }, DispatcherPriorities.ACTION)
            }
        }

        if (fields) {
            for (const fieldsKey in fields) {
                if (!Object.prototype.hasOwnProperty.call(fields, fieldsKey)) {
                    continue
                }
                instance[(fieldsKey as string)] = fields[fieldsKey]
            }
        }

        return (instance as Domain<DomainT> & ActionsT & FieldsT)
    }

    start(subscription: Subscription) { this.$.start(subscription) }
    next(candidate: T | Transformer<T>) { this.$.next(candidate) }
    error(error: Error) { this.$.error(error) }
    complete() { this.$.complete() }
    get closed() { return this.$.closed }
    get observers(): Observer<T>[] { return this.$.observers }
    subscribe(observer: Observer<T>): Subscription
    subscribe(onNext?: ValueListener<T>, onError?: ErrorListener, onCompletion?: CompletionListener): Subscription
    subscribe(...args) {
        return (this as any).$.subscribe(...args)
    }
    ref(reference: T) { this.$.ref(reference) }
    deref(): T { return this.$.deref() }
    hasRef(): boolean { return this.$.hasRef() }

    toPromise(): Promise<T> { return this.$.toPromise() }
    map<U>(action: (value: T) => U): OpStream<U> { return this.$.map(action) }
    flatten<U>(this: Domain<OpStream<U>>): OpStream<U> { return this.$.flatten() }
    scan<U>(reductor: (accumulator: U, value: T, index: number) => U, defaultValue?: U): OpStream<U> {
        return this.$.scan(reductor, defaultValue)
    }
    filter(filter: (value: T) => boolean): OpStream<T> { return this.$.filter(filter) }
    merge(...others: OpStream<T>[]): OpStream<T> { return this.$.merge(...others) }
    distinct(comparator?: (prev: T, next: T) => boolean): OpStream<T> { return this.distinct(comparator) }
    buffer(maxLastValues: number): OpStream<T[]> { return this.$.buffer(maxLastValues) }
    materialize(initialState: T): Atom<T> { return this.$.materialize(initialState) }
    vaporize(): Observable<T> { return this.$.vaporize() }
    [Symbol.asyncIterator](): AsyncIterator<T> { return this.$[Symbol.asyncIterator]() }
    then<TResult1, TResult2 = never>(
        onsuccess?: ((value: T) => PromiseLike<TResult1> | TResult1) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ) { return this.$.toPromise().then(onsuccess, onrejected) }
}
