export interface Task {
    priority: number,
    execute: () => any,
}

export class Dispatcher {
    private _isRunning = false
    public get isRunning(): boolean {
        return !!this._isRunning
    }

    tasks: Task[] = []

    push(execute: () => any, priority): Dispatcher {
        this.tasks.push({
            priority,
            execute,
        })

        return this
    }

    run() {
        if (this._isRunning) return
        this._isRunning = true
        Promise.resolve().then(() => this.loop())
    }

    loop() {
        const task = this.findNextTask()
        if (!task) {
            this._isRunning = false
            return
        }

        this.next(
            task.execute,
            () => {
                Promise.resolve().then(() => this.loop())
            }
        )
    }

    private findNextTask() {
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
    next(job: () => void, next: () => void) {
        try {
            job()
        } catch (e) {
            console.error(e.stack || e.message || e)
        }
        next()
    }
}
