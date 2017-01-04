interface Task {
    priority: number,
    job: () => any,
}

export class Dispatcher {
    private isRunning = false
    tasks: Task[] = []

    push(job: () => any, priority = 0) {
        this.tasks.push({
            priority,
            job,
        })
    }

    run() {
        if (this.isRunning) return
        this.isRunning = true

        const job = this.findNextJob()
        if (!job) {
            this.isRunning = false
            return
        }

        this.next(
            () => {
                try {
                    job.job()
                } catch (e) {
                    console.error(e.stack || e.message || e)
                }
            },
            () => {
                this.isRunning = false
                this.run()
            }
        )
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
