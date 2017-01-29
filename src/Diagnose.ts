import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'

export type DiagEntry = {
    'action name': string,
    'duration in ms': number
}
export type DiagSummaryEntry = {
    'action name': string,
    'duration in ms': number,
    'occurences': number
}
export type DiagOptions = {
    tableDetails: boolean,
    tableClear: boolean,
    tableSummary: boolean,
    timeline: boolean
}

export class Diagnose {
    list: DiagEntry[] = null
    tableIsRequested = false
    options: DiagOptions

    get isOn() {
        return this.list !== undefined
    }

    on(options: {[id in keyof DiagOptions]?: DiagOptions[id]} = {}) {
        if (!window.performance) {
            throw new Error('Performance measurements are not available in this environment')
        }
        this.options = {
            tableDetails: true,
            tableSummary: true,
            tableClear: true,
            timeline: true,
            ...options
        }
        this.list = []
    }

    off() {
        this.list = null
        this.tableIsRequested = false
    }

    measure(name: string) {
        if (!this.list) return

        if (
            (
                this.options.tableDetails ||
                this.options.tableSummary
            ) &&
            !this.tableIsRequested
        ) {
            this.tableIsRequested = true
            const intervalID = setInterval(() => {
                if (!this.tableIsRequested || this.list === null || this.list.length === 0) {
                    this.tableIsRequested = false
                    clearInterval(intervalID)
                    return
                }
                const listSummary = this.list.splice(0).reduce((summary: DiagSummaryEntry[], entry: DiagEntry) => {
                    for (let existingEntry of summary) {
                        if (existingEntry['action name'] === entry['action name']) {
                            return summary.map(
                                item => (item !== existingEntry
                                    ? item
                                    : {
                                        ...existingEntry,
                                        'duration in ms': existingEntry['duration in ms'] + entry['duration in ms'],
                                        occurences: existingEntry.occurences + 1
                                    }
                                )
                            )
                        }
                    }
                    return summary.concat([{
                        ...entry,
                        occurences: 1
                    }])
                }, [])
                this.options.tableClear && console.clear()
                this.options.tableDetails && console.table(listSummary.map(entry => ({
                    'action name': entry['action name'],
                    'duration': `${entry['duration in ms']} ms`,
                    occurences: entry.occurences,
                    'avg duration': `${entry['duration in ms'] / entry.occurences} ms`
                })))
                const totalDuration = listSummary.reduce((result, i) => result + i['duration in ms'], 0)
                this.options.tableSummary && console.table({
                    all: {
                        'duration in ms': totalDuration,
                        'est. duration budget': 500,
                        'est. duration budget usage': `${totalDuration / 500 * 100}%`
                    }
                })
            }, 1000)
        }

        if (this.options.timeline) {
            window.performance.mark(`${name}_start`)
        }
        const start = (this.options.tableDetails || this.options.tableSummary) &&
            window.performance.now()

        return () => {
            if (this.options.tableDetails || this.options.tableSummary) {
                this.list.push({ 'action name': name, 'duration in ms': window.performance.now() - start })
            }
            if (this.options.timeline) {
                window.performance.mark(`${name}_end`)
                window.performance.measure(name, `${name}_start`, `${name}_end`)
            }
        }
    }
}

export const diagnose = new Diagnose()