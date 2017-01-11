import { transducer } from './Observer'
export class CustomObserver<T> {
    constructor(
        public start: () => void,
        public next: (value: T | transducer<T>) => void,
        public error: (reason: Error) => void,
        public complete: () => void,
    ) { }
}