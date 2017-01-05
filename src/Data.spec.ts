import { Data } from './Data'

describe('Data', () => {
    it('can be created', () => {
        expect(() => {
            new Data(null)
        }).not.toThrow()
    })

    it('can be immediately read', () => {
        const value = {}
        const subject = new Data(value)
        expect(subject.last()).toBe(value)
    })

    it('can be immediately subscribed with default value', done => {
        const value = {}
        const subject = new Data(value)
        subject.subscribe(
            next => {
                expect(next).toBe(value)
                setTimeout(done)
            }
        )
    })

    it('can be written to with a value', done => {
        const value = {}
        const value2 = {}
        let expected = value
        const subject = new Data(value)
        subject.subscribe(
            next => {
                switch (true) {
                    case next === expected && next === value: {
                        expected = value2
                        break;
                    }
                    case next === expected && next === value2: {
                        setTimeout(done)
                        break;
                    }
                    default: expect(next).toBe(expected)
                }
            }
        )
        subject.write(value2)
    })

    it('can be written to with a function', done => {
        const subject = new Data(1)
        subject.subscribe(() => { }) // force digest on lazy observable

        const expectedCalls = 10
        let calls = 0
        let $: Promise<any> = new Promise(resolve => setTimeout(resolve))
        for (let i = 0; i < expectedCalls; i++) {
            $ = $.then(() =>
                subject.write(
                    next => {
                        calls++
                        return next + 1
                    }
                )
            )
        }
        $.then(() => {
            expect({ calls }).toBe({ calls: expectedCalls })
            expect({ value: subject.last() }).toBe({ value: expectedCalls })
        }).catch(e => { }).then(() => setTimeout(done))
    })
})
