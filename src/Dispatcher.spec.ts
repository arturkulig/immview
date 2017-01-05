import { Dispatcher } from './Dispatcher'

describe('Dispatcher', () => {
    it('exists', () => {
        expect(typeof Dispatcher).toBe('function')
    })

    it('can receive a job', () => {
        const dispatcher = new Dispatcher()
        expect(dispatcher.tasks.length).toBe(0)
        dispatcher.push(() => null)
        expect(dispatcher.tasks.length).toBe(1)
    })

    it('can perform a job', done => {
        new Dispatcher().push(() => setTimeout(done)).run()
    })

    it('can perform many jobs', done => {
        let counter = 0
        let expectedCounter = 100
        const tester = () => {
            counter++
            if (counter === expectedCounter) setTimeout(done)
        }
        const dispatcher = new Dispatcher()
        for (let i = 0; i < expectedCounter; i++) {
            dispatcher.push(tester)
        }
        dispatcher.run()
    })

    it('can prioritize jobs', done => {
        let result = ''
        const dispatcher = new Dispatcher()
        dispatcher.push(() => { result += 'a' }, 1)
        dispatcher.push(() => {
            expect(result).toBe('ab')
            expect(dispatcher.tasks.length).toBe(0)
            done()
        }, 3)
        dispatcher.push(() => { result += 'b' }, 2)
        dispatcher.run()
    })
})
