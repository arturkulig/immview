export class ObservableSubscription {
    public get closed(): boolean {
        return !this._unsubscribe
    }

    constructor(private _unsubscribe: () => any) { }

    public unsubscribe(): void {
        const {_unsubscribe} = this
        this._unsubscribe = null
        _unsubscribe && _unsubscribe()
    }
}