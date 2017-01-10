import { Observable } from './Observable';
export interface Actions {
    [id: string]: () => void | Promise<any>;
}
export declare class Domain<T> extends Observable<T> {
    constructor(stream: Observable<T>);
    static create<T, U extends Actions, V extends {}>(stream: Observable<T>, actions?: U, fields?: V): Domain<T> & U & V;
}
