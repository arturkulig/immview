import { Observable } from './Observable'
import { Process } from './Process'
import { flush } from './DispatcherInstance'

describe('Process', () => {
    it('runs task', () => {
        let run = false
        new Process(() => { run = true })
        expect(run).toBe(true)
    })
    it('has message box', async () => {
        const values = []
        const proc = new Process(async mb => {
            for await (const m of mb) {
                values.push(m)
            }
        })
        proc.next(1)
        proc.next(2)
        proc.next(3)
        await new Promise(r => setTimeout(r, 10))
        expect(values).toEqual([1, 2, 3])
    })
    it('is observer', async () => {
        const values = []
        const source = new Observable()
        const proc = new Process(async mb => {
            for await (const m of mb) {
                values.push(m)
            }
        })
        source.subscribe(proc)
        source.next(1)
        source.next(2)
        source.next(3)
        await new Promise(r => setTimeout(r, 10))
        expect(values).toEqual([1, 2, 3])
    })
    it('is promise-like', async () => {
        let waited = false
        await new Process(async () => {
            await new Promise(r => setTimeout(r, 10))
            waited = true
        })
        expect(waited).toBe(true)
    })
})
