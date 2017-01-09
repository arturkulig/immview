export interface Task {
    priority: number,
    job: () => any,
}

export class Dispatcher {
    private nextTickScheduler: Promise<void> = null
    private _isRunning = false
    public get isRunning(): boolean {
        return !!this._isRunning
    }

    tasks: Task[] = []

    push(job: () => any, priority = 0): Dispatcher {
        this.tasks.push({
            priority,
            job,
        })

        return this
    }

    run() {
        if (this._isRunning) return
        this._isRunning = true

        const job = this.findNextJob()
        if (!job) {
            this.nextTickScheduler = null
            this._isRunning = false
            return
        }

        (this.nextTickScheduler = this.nextTickScheduler || Promise.resolve())
            .then(() => {
                this.next(
                    () => {
                        try {
                            job.job()
                        } catch (e) {
                            console.error(e.stack || e.message || e)
                        }
                    },
                    () => {
                        this._isRunning = false
                        this.run()
                    }
                )
            })
    }

    private findNextJob() {
        let maxPriorityJobIdx: number = null
        for (let i = 0; i < this.tasks.length; i++) {
            if (
                maxPriorityJobIdx === null ||
                this.tasks[i].priority < this.tasks[maxPriorityJobIdx].priority
            ) {
                maxPriorityJobIdx = i
            }
        }
        if (maxPriorityJobIdx === null) return null
        return this.tasks.splice(maxPriorityJobIdx, 1)[0]
    }

    /*
     * Function can be replaced with a custom implementation
     * for integrating different scheduling strategy
     */
    next(job, next) {
        job()
        next()
    }
}
