import { transducer } from './Observer';
export declare class CustomObserver<T> {
    start: () => void;
    next: (value: T | transducer<T>) => void;
    error: (reason: Error) => void;
    complete: () => void;
    constructor(start: () => void, next: (value: T | transducer<T>) => void, error: (reason: Error) => void, complete: () => void);
}
