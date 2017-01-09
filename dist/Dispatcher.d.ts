export interface Task {
    priority: number;
    job: () => any;
}
export declare class Dispatcher {
    private nextTickScheduler;
    private _isRunning;
    readonly isRunning: boolean;
    tasks: Task[];
    push(job: () => any, priority?: number): Dispatcher;
    run(): void;
    private findNextJob();
    next(job: any, next: any): void;
}
