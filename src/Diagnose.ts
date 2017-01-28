import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'

export type DiagEntry = { 'action name': string, 'action duration in ms': number }
export type DiagSummaryEntry = { 'action name': string, 'action duration in ms': number, 'occurences': number }

export class Diagnose {
    list: DiagEntry[] = null
    tableIsRequested = false

    get isOn() {
        return this.list !== undefined
    }

    on() {
        if (!window.performance) return
        this.list = []
    }

    off() {
        this.list = null
    }

    measure(name: string) {
        if (!this.list) return

        if (!this.tableIsRequested) {
            this.tableIsRequested = true
            dispatch(() => {
                this.tableIsRequested = false
                console.table(
                    this.list.splice(0).reduce((summary: DiagSummaryEntry[], entry: DiagEntry) => {
                        for (let existingEntry of summary) {
                            if (existingEntry['action name'] === entry['action name']) {
                                return summary.filter(item => item !== existingEntry).concat([{
                                    ...existingEntry,
                                    'action duration in ms': existingEntry['action duration in ms'] + entry['action duration in ms'],
                                    occurences: existingEntry.occurences + 1
                                }])
                            }
                        }
                        return summary.concat([{
                            ...entry,
                            occurences: 1
                        }])
                    }, [])
                )
            }, DispatcherPriorities.DOMAIN)
        }

        window.performance.mark(`${name}_start`)
        const start = window.performance.now()
        return () => {
            this.list.push({ 'action name': name, 'action duration in ms': window.performance.now() - start })
            window.performance.mark(`${name}_end`)
            window.performance.measure(name, `${name}_start`, `${name}_end`)
        }
    }
}

export const diagnose = new Diagnose()