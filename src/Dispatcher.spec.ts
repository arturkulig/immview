import { Dispatcher } from './Dispatcher'

describe('Dispatcher', () => {
    it('exists', () => {
        expect(typeof Dispatcher).toBe('function')
    })

    it('can receive a job', () => {
        const dispatcher = new Dispatcher()
        expect(dispatcher.tasks.length).toBe(0)
        dispatcher.push(() => null, 0)
        expect(dispatcher.tasks.length).toBe(1)
    })

    it('can perform a job', done => {
        new Dispatcher().push(() => setTimeout(done), 0).run()
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
            dispatcher.push(tester, 0)
        }
        dispatcher.run()
    })

    it('can prioritize jobs', done => {
        let result = ''
        const dispatcher = new Dispatcher()
        dispatcher.push(() => {
            expect(result).toBe('ab')
            expect(dispatcher.tasks.length).toBe(0)
            done()
        }, 3)
        dispatcher.push(() => { result += 'a' }, 1)
        dispatcher.push(() => { result += 'b' }, 2)
        dispatcher.run()
    })

    it('priorities below zero are not deferred', done => {
        let result = 1
        const dispatcher = new Dispatcher()
        dispatcher.push(() => { result = 2 }, 1)
        dispatcher.push(() => { result = 3 }, -1)
        dispatcher.run()
        expect(result = 3)
        setTimeout(() => {
            expect(result = 2)
            done()
        })
    })

    it('will break if there is more that 1024 subsequent dispatcher actions', done => {
        let shouldFinish = false
        const dispatcher = new Dispatcher()
        dispatcher.tooManyCalls = () => {
            shouldFinish = true
            done()
        }
        function recursiveDispatcherCall() {
            if (shouldFinish) return
            dispatcher.push(recursiveDispatcherCall, 1)
            dispatcher.run()
        }
        recursiveDispatcherCall()
    })
})
