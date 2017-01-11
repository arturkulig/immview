export declare class Subscription {
    private customUnsubscribe;
    private isSubscriptionActive;
    constructor(customUnsubscribe: () => any, isSubscriptionActive: () => boolean);
    readonly closed: boolean;
    unsubscribe(): void;
}
