export interface Task {
    priority: number,
    execute: () => any,
}

export class Dispatcher {
    private running = false
    private deferred = false
    private subsequentCalls: number = 0

    get isRunning(): boolean {
        return this.running
    }

    tasks: Task[] = []

    push(execute: () => any, priority): Dispatcher {
        for (let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].priority > priority) {
                this.tasks.splice(i, 0, { execute, priority })
                return this
            }
        }
        this.tasks.push({ execute, priority })
        return this
    }

    run() {
        if (this.running) return
        this.running = true
        this.loop()
    }

    loop = () => {
        const task = this.findNextTask()

        if (!task) {
            this.running = false
            this.deferred = false
            this.subsequentCalls = 0
            return
        }

        if (this.subsequentCalls > 1024) {
            this.tooManyCalls()
        }

        this.subsequentCalls++

        if (task.priority > 0 && !this.deferred) {
            Promise.resolve().then((() => {
                this.deferred = true
                this.next(
                    task.execute,
                    this.loop
                )
            }))
        } else {
            this.next(
                task.execute,
                this.loop
            )
        }

    }

    tooManyCalls() {
        'If you see this, that means your code sent too many subsequent messages.'
        'This situation is considered harmful, as it may introduce serious lag of your app.'
        'Please handle this situation and limit how many messages are pushed at once.'
        debugger
    }

    private findNextTask() {
        if (this.tasks.length === 0) return null
        return this.tasks.splice(0, 1)[0]
    }

    /*
     * Function can be replaced with a custom implementation
     * for integrating different scheduling strategy
     */
    next(job: () => void, nextJob: () => void) {
        try {
            job()
        } catch (e) {
            console.error(e.stack || e.message || e)
        }
        nextJob()
    }
}

function sortTasks(a: Task, b: Task) {
    return a.priority - b.priority
}