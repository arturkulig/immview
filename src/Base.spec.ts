import { dispatch, flush } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Base } from './Base'
import { BaseObservable } from './BaseObservable'
import { BaseAtom } from './BaseAtom'
import { Observer, NO_VALUE } from './Types'

const fail = function (done, msg): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe('')
        setTimeout(done, 0)
    }
}

const BaseDerivatives: [<T>(v: T) => Base<T>, string][] = [
    [first => new BaseObservable(observer => observer.next(first)), 'BaseObservable'],
    [first => new BaseAtom(first), 'BaseAtom'],
]

BaseDerivatives.forEach(([make, name]) => {
    describe(name, () => {
        describe('provides observer to subscriber', () => {
            it('allowing pushing plain values', done => {
                const $ = make(5)
                $.subscribe(
                    value => {
                        expect(value).toBe(5)
                        setTimeout(done, 0)
                    },
                    fail(done, 'Error sub trigger'),
                    fail(done, 'Completion sub trigger')
                )
            })

            it('allowing pushing values with functions', done => {
                const firstValueTester = value => {
                    expect(value).toBe(2)
                    tester = secondValueTester
                }
                const secondValueTester = value => {
                    expect(value).toBe(5)
                    setTimeout(done, 0)
                }
                let tester = firstValueTester
                const $ = make(2)
                $.subscribe(
                    value => { tester(value) },
                    fail(done, 'Error sub trigger'),
                    fail(done, 'Completion sub trigger')
                )
                $.next(i => i + 3)
            })

            it('allowing pushing errors', done => {
                const $ = make(null)
                $.subscribe(null, err => {
                    expect(err.message).toBe('666')
                    setTimeout(done, 0)
                })
                $.error(new Error('666'))
            })

            it('ignoring values and errors after stream became complete', async done => {
                const $ = make(null)
                const sub = $.subscribe(
                    v => {
                        if (v === 666) {
                            fail(done, 'Error sub trigger')()
                        }
                    },
                    fail(done, 'Error sub trigger'),
                    () => {
                        expect({ observableClosed: $.closed }).toEqual({ observableClosed: true })
                        expect({ subscriptionClosed: sub.closed }).toEqual({ subscriptionClosed: true })
                        setTimeout(done, 0)
                    }
                )

                $.complete()
                $.next(666)
                $.error(new Error())
            })

            it('does not forget values after pushing errors', done => {
                const initValue = 4
                const $ = make(initValue)
                const instructions: [string, any][] = [
                    ['next', 5],
                    ['error', new Error('666')],
                    ['next', 5],
                    ['error', new Error('666')]
                ]
                const expectedValues: [string, any][] = [
                    ['next', initValue],
                    ...instructions
                ]

                const result = []
                const verify = () => {
                    if (result.length < expectedValues.length) return
                    expect(result).toEqual(expectedValues)
                    setTimeout(done, 0)
                }

                $.subscribe(
                    value => {
                        result.push(['next', value])
                        verify()
                    },
                    err => {
                        result.push(['error', err])
                        verify()
                    }
                )
                instructions.forEach(([kind, value]) => $[kind](value))
            })

            it('pushes messages in request order', done => {
                const result = []

                const o1 = make(null)
                const o2 = make(null)
                const o3 = make(null)

                o1.subscribe(value => result.push(value))
                o2.subscribe(value => result.push(value))
                o3.subscribe(value => result.push(value))

                o1.next('o1.1')
                o2.next('o2.1')
                o3.next('o3.1')
                o1.next('o1.2')

                flush().then(() => {
                    expect(result).toEqual([
                        null,
                        null,
                        null,
                        'o1.1',
                        'o2.1',
                        'o3.1',
                        'o1.2',
                    ])
                    setTimeout(done, 0)
                })
            })
        })

        describe('is Observer', () => {
            it('allows pushing plain values', done => {
                const $ = make(null)
                $.subscribe(value => {
                    if (value === 5) setTimeout(done, 0)
                })
                $.next(5)
            })

            it('allows pushing values transformer', done => {
                const $ = make<number>(null)
                $.subscribe(value => {
                    if (value === 5) setTimeout(done, 0)
                })
                $.next(() => 2)
                $.next(i => i + 3)
            })

            it('allows pushing errors', done => {
                const $ = make(null)
                $.subscribe(null, () => {
                    setTimeout(done, 0)
                })
                $.error(new Error())
            })

            it('allows pushing completion signal', done => {
                const $ = make(null)
                $.subscribe(null, null, () => {
                    setTimeout(done, 0)
                })
                $.complete()
            })
        })

        describe('subscription', () => {
            it('subscription gets closed on demand', done => {
                const values = []
                const $ = make(0)
                const subscription = $.subscribe(v => { values.push(v) })

                $.next(1)
                flush().then(() => {
                    expect(values).toEqual([0, 1])
                    $.next(2)
                })
                flush().then(() => {
                    expect(values).toEqual([0, 1, 2])
                })
                flush().then(() => {
                    subscription.unsubscribe()
                    expect(subscription.closed).toBe(true)
                    $.next(3)
                })
                flush().then(() => {
                    expect(values).toEqual([0, 1, 2])
                    setTimeout(done, 0)
                })
            })

            it('subscription gets closed on completion', done => {
                const values = []
                const $ = make(0)
                const subscription = $.subscribe(v => { values.push(v) })

                $.next(1)
                flush().then(() => {
                    expect(values).toEqual([0, 1])

                    $.next(2)
                })
                flush().then(() => {
                    expect(values).toEqual([0, 1, 2])

                    $.complete()
                })
                flush().then(() => {
                    expect(subscription.closed).toBe(true)

                    $.next(3)
                })
                flush().then(() => {
                    expect(values).toEqual([0, 1, 2])
                    setTimeout(done, 0)
                })
            })
        })

        describe('is async iterable', async () => {
            const $ = make<number>(0)
            const gotValues = (async () => {
                const got: number[] = []
                for await (const v of $) {
                    got.push(v)
                }
                return got
            })()
            await flush()
            $.next(2)
            $.next(1)
            $.complete()
            expect(await gotValues).toEqual([0, 2, 1])

            $.next(2)
            $.next(1)
            const completedValues = (async () => {
                const got: number[] = []
                for await (const v of $) {
                    got.push(v)
                }
                return got
            })()
            expect(await completedValues).toEqual([])
        })
    })

})
