export interface Task {
    priority: number,
    execute: () => any,
}

export class Dispatcher {
    private _isRunning = false
    public get isRunning(): boolean {
        return this._isRunning
    }
    private subsequentCalls: number = 0

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
        Promise.resolve().then(this.loop)
    }

    loop = () => {
        const task = this.findNextTask()
        if (!task) {
            this._isRunning = false
            this.subsequentCalls = 0
            return
        }

        if (this.subsequentCalls > 1024) {
            this.tooManyCalls()
        }

        this.subsequentCalls++

        this.next(
            task.execute,
            this.loop
        )
    }

    tooManyCalls() {
        'If you see this, that means your code sent too many subsequent messages.'
        'This situation is considered harmful, as it may introduce serious lag of your app.'
        'Please handle this situation and limit how many messages are pushed at once.'
        debugger
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
