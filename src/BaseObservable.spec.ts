import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
const { ALL } = DispatcherPriorities
import { BaseObservable } from './BaseObservable'
import { Observer, NO_VALUE } from './Types'

const fail = function (done, msg): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe('')
        setTimeout(done)
    }
}

describe('BaseObservable', () => {
    describe('can be created', () => {
        it('with nothing', () => {
            expect(() => {
                new BaseObservable()
            }).not.toThrow()
        })

        it('with subscriber function', () => {
            expect(() => {
                new BaseObservable(() => { })
            }).not.toThrow()
        })

        it('w/o subscriber function', () => {
            expect(() => {
                new BaseObservable(null)
                new BaseObservable()
            }).not.toThrow()
        })
    })

    describe('provides observer to subscriber', () => {
        it('allowing pushing plain values', done => {
            new BaseObservable<number>(observer => {
                observer.next(5)
            }).subscribe(value => {
                expect(value).toBe(5)
                setTimeout(done)
            }, fail(done, 'Error sub trigger'), fail(done, 'Completion sub trigger'))
        })

        it('allowing pushing values with functions', done => {
            const firstValueTester = value => {
                expect(value).toBe(2)
                tester = secondValueTester
            }
            const secondValueTester = value => {
                expect(value).toBe(5)
                setTimeout(done)
            }
            let tester = firstValueTester
            new BaseObservable<number>(observer => {
                observer.next(() => 2)
                observer.next(i => i + 3)
            }).subscribe(value => {
                tester(value)
            }, fail(done, 'Error sub trigger'), fail(done, 'Completion sub trigger'))
        })

        it('allowing multiple subscriptions before pushing values', done => {
            const subject = new BaseObservable(observer => {
                observer.next(5)
            })
            let o1SubHit = null
            subject.subscribe(v => { o1SubHit = v })
            let o2SubHit = null
            subject.subscribe(v => { o2SubHit = v })
            dispatch(() => {
                expect({ o1SubHit }).toEqual({ o1SubHit: 5 })
                expect({ o2SubHit }).toEqual({ o2SubHit: 5 })
                setTimeout(done)
            }, ALL)
        })

        it('allowing pushing errors', done => {
            new BaseObservable(observer => {
                observer.error(new Error('666'))
            }).subscribe(null, err => {
                expect(err.message).toBe('666')
                setTimeout(done)
            })
        })

        it('ignoring values and errors after stream became complete', done => {
            const obs = new BaseObservable(observer => {
                observer.complete()
                observer.next(0)
                observer.error(new Error())
            })
            const sub = obs.subscribe(
                fail(done, 'Value sub trigger'),
                fail(done, 'Error sub trigger'),
                () => {
                    expect({ observableClosed: obs.closed }).toEqual({ observableClosed: true })
                    expect({ subscriptionClosed: sub.closed }).toEqual({ subscriptionClosed: true })
                    setTimeout(done)
                }
            )
        })

        it('does not forget values after pushing errors', done => {
            const expectedValues: [string, any][] = [
                ['next', 5],
                ['error', new Error('666')],
                ['next', 5],
                ['error', new Error('666')]
            ]
            const result = []
            const verify = () => {
                if (result.length < expectedValues.length) return
                expect(result).toEqual(expectedValues)
                setTimeout(done)
            }
            new BaseObservable(observer => {
                expectedValues.forEach(([kind, value]) => {
                    observer[kind](value)
                })
            }).subscribe(
                value => {
                    result.push(['next', value])
                    verify()
                },
                err => {
                    result.push(['error', err])
                    verify()
                })
        })

        it('pushes messages in request order', done => {
            const result = []
            const actions = []
            const o1 = new BaseObservable(observer => {
                actions[0] = () => { observer.next('o1.1') }
                actions[3] = () => { observer.next('o1.2') }
            })
            const o2 = new BaseObservable(observer => {
                actions[1] = () => { observer.next('o2.1') }
            })
            const o3 = new BaseObservable(observer => {
                actions[2] = () => { observer.next('o3.1') }
            })
            o1.subscribe(value => result.push(value))
            o2.subscribe(value => result.push(value))
            o3.subscribe(value => result.push(value))
            actions.forEach(action => action())

            dispatch(() => {
                expect(result).toEqual([
                    'o1.1',
                    'o2.1',
                    'o3.1',
                    'o1.2',
                ])
                setTimeout(done)
            }, ALL)
        })
    })

    describe('is Observer', () => {
        it('allows pushing plain values', done => {
            const subject = new BaseObservable()
            subject.next(5)
            subject.subscribe(value => {
                if (value === 5) setTimeout(done)
            })
        })

        it('allows pushing values transformer', done => {
            const subject = new BaseObservable<number>()
            subject.next(() => 2)
            subject.next(i => i + 3)
            subject.subscribe(value => {
                if (value === 5) setTimeout(done)
            })
        })

        it('allows pushing errors', done => {
            const subject = new BaseObservable()
            subject.error(new Error)
            subject.subscribe(null, () => {
                setTimeout(done)
            })
        })

        it('allows pushing completion signal', done => {
            const subject = new BaseObservable()
            subject.complete()
            subject.subscribe(null, null, () => {
                setTimeout(done)
            })
        })
    })

    it('has previous() equal to last pushed value', done => {
        const subject = new BaseObservable(observer => { observer.next(6) })
        expect(subject.previous()).toBe(NO_VALUE)
        subject.subscribe(value => {
            expect(value).toEqual(subject.previous())
            done()
        })
    })

    describe('subscription', () => {
        it('subscription gets closed on demand', done => {
            let next = null
            const values = []
            const subscription = new BaseObservable(
                observer => {
                    next = v => observer.next(v)
                }
            )
                .subscribe(v => { values.push(v) })

            dispatch(() => {
                next(1)
            }, ALL)
            dispatch(() => {
                expect(values).toEqual([1])
                next(2)
            }, ALL)
            dispatch(() => {
                expect(values).toEqual([1, 2])
            }, ALL)
            dispatch(() => {
                subscription.unsubscribe()
                expect(subscription.closed).toBe(true)
                next(3)
            }, ALL)
            dispatch(() => {
                expect(values).toEqual([1, 2])
                setTimeout(done)
            }, ALL)
        })

        it('subscription gets closed on completion', done => {
            let next = null
            let complete = null
            const values = []

            const subscription = new BaseObservable(
                observer => {
                    next = v => observer.next(v)
                    complete = () => observer.complete()
                }
            )
                .subscribe(v => { values.push(v) })

            next(1)
            dispatch(() => {
                expect(values).toEqual([1])

                next(2)
            }, ALL)
            dispatch(() => {
                expect(values).toEqual([1, 2])

                complete()
            }, ALL)
            dispatch(() => {
                expect(subscription.closed).toBe(true)

                next(3)
            }, ALL)
            dispatch(() => {
                expect(values).toEqual([1, 2])
                setTimeout(done)
            }, ALL)
        })
    })
})
