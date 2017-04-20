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
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatchAndReturn } from './DispatcherInstance'
import { diagnose } from './Diagnose'

export interface Actions<T> {
    [id: string]: (this: Domain<T>, ...args: any[]) => void | Promise<any>
}

export class Domain<T> implements OpStream<T> {
    constructor(
        protected $: OpStream<T>
    ) {
        if (!$) {
            throw new Error('Domain cannot be created without a (Observable/Atom/Domain) source')
        }
    }

    public static tagged(parts: TemplateStringsArray, ...filling: string[]) {
        const creator: typeof Domain.create = (...args) => {
            const instance = Domain.create.apply(undefined, args)
            instance.name = parts.reduce((result, item, i) => result + (i > 0 ? filling[i - 1] : '') + item)
            return instance
        }
        return creator
    }

    public static create<DomainT, ActionsT extends Actions<DomainT>, FieldsT extends {}>(name: string, stream: OpStream<DomainT>, actions: ActionsT, fields: FieldsT): Domain<DomainT> & ActionsT & FieldsT
    public static create<DomainT, ActionsT extends Actions<DomainT>>(name: string, stream: OpStream<DomainT>, actions: ActionsT): Domain<DomainT> & ActionsT
    public static create<DomainT, ActionsT extends Actions<DomainT>, FieldsT extends {}>(stream: OpStream<DomainT>, actions: ActionsT, fields: FieldsT): Domain<DomainT> & ActionsT & FieldsT
    public static create<DomainT, ActionsT extends Actions<DomainT>>(stream: OpStream<DomainT>, actions: ActionsT): Domain<DomainT> & ActionsT
    public static create<T, U extends Actions<T>, V extends {}>(...args: any[]) {
        let name: string
        let $: OpStream<T>
        let actions: U
        let fields: V

        if (typeof args[0] === 'string') {
            name = args.shift()
        }
        if (typeof args[0] === 'object' && args[0] !== null && typeof args[0].subscribe === 'function') {
            $ = args.shift()
        }
        actions = args.shift()
        fields = args.shift()

        const instance = (new Domain($) as Object)
        instance['name'] = name !== undefined ? name : `${(instance as Domain<T>).$.name}\$!`

        if (actions) {
            for (let actionsKey in actions) {
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
            for (let fieldsKey in fields) {
                if (!Object.prototype.hasOwnProperty.call(fields, fieldsKey)) {
                    continue
                }
                instance[(fieldsKey as string)] = fields[fieldsKey]
            }
        }

        return (instance as Domain<T> & U & V)
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
    throw(reason: Error): void { this.$.throw(reason) }
    destroy(): void { this.$.destroy() }

    name: string

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
}
