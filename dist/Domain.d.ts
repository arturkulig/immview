import { Observable } from './Observable';
export declare class Domain<T> extends Observable<T> {
    constructor(stream: Observable<T>);
    static create<T, U extends {
        [id: string]: () => Promise<void> | void;
    }, V extends {}>(stream: Observable<T>, actions?: U, fields?: V): Domain<T> & U & V;
}
