interface Job {
    priority: number,
    task: () => any,
    resolve: (result: any) => void,
    reject: (reason: any) => void
}

export class Dispatcher {
    private isRunning = false
    jobs: Job[] = []

    push(task: () => any, priority = 0) {
        return new Promise((resolve, reject) => {
            this.jobs.push({
                priority,
                task,
                resolve,
                reject
            })
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
                    job.resolve(job.task())
                } catch (e) {
                    job.reject(e)
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
        for (let i = 0; i < this.jobs.length; i++) {
            if (
                maxPriorityJobIdx === null ||
                this.jobs[i].priority < this.jobs[maxPriorityJobIdx].priority
            ) {
                maxPriorityJobIdx = i
            }
        }
        if (maxPriorityJobIdx === null) return null
        return this.jobs.splice(maxPriorityJobIdx, 1)[0]
    }

    next(job, next) {
        job()
        next()
    }
}