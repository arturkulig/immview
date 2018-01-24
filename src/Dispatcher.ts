export interface Task {
    priority: number,
    execute: () => any,
}

export class Dispatcher {
    private running = false
    private subsequentCalls: number = 0

    get isRunning(): boolean {
        return this.running
    }

    tasks: Task[] = []

    push(execute: () => any, priority): this {
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
            this.subsequentCalls = 0
            return
        }

        if (this.subsequentCalls > 1024) {
            this.tooManyCalls()
            this.subsequentCalls = 0
        }

        this.subsequentCalls++

        this.execute(task.execute)
    }

    execute(task) {
        try {
            this.next(task, this.loop)
        } catch (e) {
            console.error(e.stack || e.message || e)
        }
    }

    tooManyCalls() {
        debugger
        if (typeof console === 'undefined' || !console || !console.warn) { return }
        console.warn(['If you see this, that means your code streamed many subsequent messages.',
            'This situation might be harmful, as it may introduce serious lag of your app.',
            'This is just a warning and a way to introduce a break, so you won\'t end up with unresponsive app',
            'Please handle this situation and limit how many messages are pushed at once if possible.',].join('\r\n'))
    }

    private findNextTask() {
        if (this.tasks.length === 0) return null
        return this.tasks.splice(0, 1)[0]
    }

    /*
     * Function can be replaced with a user implementation
     * for introducing custom scheduling strategy
     */
    next(job: () => void, nextJob: () => void) {
        job()
        nextJob()
    }
}
