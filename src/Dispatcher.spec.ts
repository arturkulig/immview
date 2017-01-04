import { Dispatcher } from './Dispatcher'

describe("Dispatcher", () => {
    it("exists", () => {
        expect(typeof Dispatcher).toBe('function')
    })

    it("can receive a job", () => {
        const dispatcher = new Dispatcher()
        expect(dispatcher.tasks.length).toBe(0)
        dispatcher.push(() => null)
        expect(dispatcher.tasks.length).toBe(1)
    })

    it("can perform a job", () => {
        let done = false
        const dispatcher = new Dispatcher()
        dispatcher.push(() => { done = true })
        expect(done).toBe(false)
        dispatcher.run()
        expect(done).toBe(true)
        expect(dispatcher.tasks.length).toBe(0)        
    })

    it("can perform many jobs", () => {
        let counter = 0
        let expectedCounter = 100
        const dispatcher = new Dispatcher()
        for (let i = 0; i < expectedCounter; i++) {
            dispatcher.push(() => { counter++ })
        }
        dispatcher.run()
        expect(counter).toBe(expectedCounter)
        expect(dispatcher.tasks.length).toBe(0)        
    })

    it("can prioritize jobs", () => {
        let result = ''
        const dispatcher = new Dispatcher()
        dispatcher.push(() => { result += 'a' }, 1)
        dispatcher.push(() => { result += 'c' }, 3)
        dispatcher.push(() => { result += 'b' }, 2)
        dispatcher.run()
        expect(result).toBe('abc')
        expect(dispatcher.tasks.length).toBe(0)        
    })
})
