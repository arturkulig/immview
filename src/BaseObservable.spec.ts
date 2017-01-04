import { Dispatcher } from './DispatcherInstance'
import { BaseObservable } from './BaseObservable'

const impossibru = function (done, msg): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe(''); setTimeout(done)
    }
}

describe('BaseObservable', () => {
    it('can be created with subscriber function', () => {
        expect(() => {
            new BaseObservable(() => {})
        }).not.toThrow()
    })
    
    it('can be created w/o subscriber function', () => {
        expect(() => {
            new BaseObservable(null)
            new BaseObservable()
        }).not.toThrow()
    })
    
    it('pushes plain values', done => {
        new BaseObservable<number>(observer => {
            observer.next(5)
        }).subscribe(value => {
            expect(value).toBe(5)
            setTimeout(done)
        }, impossibru(done, 'Error sub trigger'), impossibru(done, 'Completion sub trigger'))
    })
    
    it('pushes values with functions', done => {
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
        }, impossibru(done, 'Error sub trigger'), impossibru(done, 'Completion sub trigger'))
    })

    it('pushes errors', done => {
        new BaseObservable(observer => {
            observer.error(new Error('666'))
        }).subscribe(null, err => {
            expect(err.message).toBe('666')
            setTimeout(done)
        })
    })

    it('does not push completion event after stream is closed', done => {
        const obs = new BaseObservable(observer => {
            observer.complete()
            observer.next(0)
        })
        const sub = obs.subscribe(
            impossibru(done, 'Value sub trigger'),
            impossibru(done, 'Error sub trigger'),
        )
        expect({ observableClosed: obs.closed }).toEqual({ observableClosed: true })
        expect({ subscriptionClosed: sub.closed }).toEqual({ subscriptionClosed: true })
        setTimeout(done)
    })

    it('does not forget error after a value being pushed', done => {
        let errorHandled = false
        new BaseObservable<number>(observer => {
            observer.error(new Error('666'))
            observer.next(5)
        }).subscribe(
            value => {
                expect({errorHandled}).toEqual({errorHandled: true})
                expect(value).toBe(5)
                setTimeout(done)
            },
            err => {
                errorHandled = true
            })
    })

    it('does not forget values after pushing errors', done => {
        const happened = []
        const verify = () => {
            if (happened.length < 2) return
            expect(happened).toEqual([
                ['value', 5],
                ['error', new Error('666')]
            ])
            setTimeout(done)
        }
        new BaseObservable(observer => {
            observer.next(5)
            observer.error(new Error('666'))
        }).subscribe(
            value => {
                happened.push(['value', value])
                verify()
            },
            err => {
                happened.push(['error', err])
                verify()
            })
    })

    it('pushes messages in request order', () => {
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
        Dispatcher.push(() => {
            actions.forEach(action => action())
        })
        Dispatcher.run()
        expect(result).toEqual([
            'o1.1',
            'o2.1',
            'o3.1',
            'o1.2',
        ])
    })

    it('subscription gets closed on demand', () => {
        let next = null
        const values = []

        const subscription = new BaseObservable(observer => {
            next = v => observer.next(v)
        }).subscribe(v => { values.push(v) })

        next(1)
        expect(values).toEqual([1])
        next(2)
        expect(values).toEqual([1, 2])

        subscription.unsubscribe()
        expect(subscription.closed).toBe(true)

        next(3)
        expect(values).toEqual([1, 2])
    })

    it('subscription gets closed on completion', () => {
        let next = null
        let complete = null
        const values = []

        const subscription = new BaseObservable(observer => {
            next = v => observer.next(v)
            complete = () => observer.complete()
        }).subscribe(v => { values.push(v) })

        next(1)
        expect(values).toEqual([1])
        next(2)
        expect(values).toEqual([1, 2])

        complete()
        expect(subscription.closed).toBe(true)

        next(3)
        expect(values).toEqual([1, 2])
    })

    it('can be create with static from', done => {
        let result = []
        BaseObservable.from([1, 2, 3]).subscribe(
            value => {
                result.push(value)
                if (result.length === 3) {
                    setTimeout(done)
                }
            }
        )
    })

    it('can be create with static of', done => {
        let result = []
        BaseObservable.of(1, 2, 3).subscribe(
            value => {
                result.push(value)
                if (result.length === 3) {
                    setTimeout(done)
                }
            }
        )
    })
})
