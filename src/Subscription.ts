export class Subscription {
    constructor(private customUnsubscribe: () => any, private isSubscriptionActive: () => boolean) { }

    public get closed(): boolean {
        return !this.isSubscriptionActive()
    }

    public unsubscribe(): void {
        const { customUnsubscribe } = this
        if (customUnsubscribe) {
            this.customUnsubscribe = null
            customUnsubscribe && customUnsubscribe()
        }
    }
}