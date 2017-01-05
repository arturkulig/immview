import { Observable } from './Observable'

export class Merge<T extends Object> extends Observable<T> {
    constructor(sources: { [id: string]: Observable<any> }) {
        let push = null
        const subscriptions = []

        super(observer => {
            for (let key in sources) {
                if (!Object.prototype.hasOwnProperty.call(sources, key)) continue
                subscriptions.push(
                    sources[key].subscribe(sourceValue => {
                        observer.next(merged => {
                            return ({
                                ...(merged as Object),
                                [key]: sourceValue
                            } as T)
                        })
                    })
                )
            }

            return () => {
                subscriptions.forEach(subscription => subscription())
            }
        })
    }
}
