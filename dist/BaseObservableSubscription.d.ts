export declare class BaseObservableSubscription {
    private _unsubscribe;
    readonly closed: boolean;
    constructor(_unsubscribe: () => any);
    unsubscribe(): void;
}
