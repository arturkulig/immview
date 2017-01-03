import { Observable } from './Observable'

export class Merge<T extends Object> extends Observable<T> {
    constructor(sources: { [id: string]: Observable<any> }) {
        let push = null
        let startValue: T = ({} as T)
        const subscriptions = []

        for (let key in sources) {
            if (!Object.prototype.hasOwnProperty.call(sources, key)) continue
            subscriptions.push(
                sources[key].subscribe(sourceValue => {
                    if (push) {
                        push(merged => {
                            return ({
                                ...(merged as Object),
                                [key]: sourceValue
                            } as T)
                        })
                    } else {
                        startValue = ({
                            ...(startValue as Object),
                            [key]: sourceValue
                        } as T)
                    }
                })
            )
        }

        super(observer => {
            push = observer.next
            push(startValue)

            return () => {
                subscriptions.forEach(subscription => subscription())
            }
        })
    }
}