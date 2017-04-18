import { Atom } from './Atom'
import {
    Subscription,
    Stream,
} from './Types'

export class Combine<V extends {}> extends Atom<V> {
    sources: {[id in keyof V]: Stream<V[id]> }
    constructor(sources: {[id in keyof V]: Stream<V[id]> }) {
        const sourceNames = [] as { key: string, name: string }[]

        super(mapMap(sources, (source, key) => source.deref()))

        this.sources = sources

        let completions = 0
        forEachMap(sources, (source, key) => {
            sourceNames.push({ key, name: source.name })
            source.subscribe(
                value => {
                    this.next(state => ({ ...(state as {}), [key]: value } as V))
                },
                error => {
                    this.error(error)
                },
                () => {
                    completions++
                    if (completions === sourceNames.length) {
                        this.complete()
                    }
                }
            )
        })

        this.name = `{${
            sourceNames
                .map(({ key, name }) => (
                    (
                        !name &&
                        name !== key
                    )
                        ? `${key}: ${name}`
                        : key
                ))
                .join(', ')
            }}`
    }
}

function
    mapMap<IN, OUT extends {[OUTk in keyof IN]: any}>
    (input: IN, trans: (value: IN[keyof IN], key: keyof IN) => OUT[keyof IN]): OUT {
    const result: OUT = {} as any
    forEachMap<IN, keyof IN>(input, (v, k) => {
        result[k as any] = trans(v, k)
    })
    return result
}

function forEachMap<T, K extends keyof T>(input: T, action: (value: T[K], key: K) => void) {
    for (let name in input) {
        if (!Object.prototype.hasOwnProperty.call(input, name)) return
        action(input[name as K], name as K)
    }
}
