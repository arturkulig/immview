import { Observable } from './Observable'
import { Subscription } from './Subscription'

export class Combine<V extends {}> extends Observable<V> {
    constructor(sources: {[id in keyof V]: Observable<V[id]> }) {
        super(observer => {
            const names: string[] = []
            const initialized: string[] = []

            let preinitialReceivedMessages: [string, any][] = []
            let result = ({} as V)

            const subscriptions: Subscription[] = []
            for (let key in sources) {
                if (!Object.prototype.hasOwnProperty.call(sources, key)) continue
                names.push(key)
                subscriptions.push(
                    sources[key].subscribe(nextSourceValue => {
                        preinitialReceivedMessages && preinitialReceivedMessages.push([key, nextSourceValue])
                        if (initialized.indexOf(key) < 0) {
                            initialized.push(key)
                        }

                        if (names.length !== initialized.length) {
                            return
                        }

                        if (preinitialReceivedMessages) {
                            let initialMessage = ({} as V)
                            let initializedFields: string[] = []
                            const repeatedPreinitialReceivedMessages: [string, any][] = []
                            for (let i = 0; i < preinitialReceivedMessages.length; i++) {
                                if (initializedFields.indexOf(preinitialReceivedMessages[i][0]) < 0) {
                                    const [sourceName, sourceMessage] = preinitialReceivedMessages[i]
                                    initialMessage[sourceName] = sourceMessage
                                    initializedFields.push(sourceName)
                                } else {
                                    repeatedPreinitialReceivedMessages.push(preinitialReceivedMessages[i])
                                }
                            }
                            observer.next(result = initialMessage)
                            repeatedPreinitialReceivedMessages.forEach(([sourceName, sourceMessage]) => {
                                observer.next(result = ({
                                    ...(result as {}),
                                    [sourceName]: sourceMessage
                                } as V))
                            })
                            preinitialReceivedMessages = null
                            return
                        }

                        observer.next(result = ({
                            ...(result as {}),
                            [key]: nextSourceValue
                        } as V))
                    }, error => {
                        observer.error(error)
                    }, () => {
                        observer.complete()
                    })
                )
            }

            return () => {
                subscriptions.forEach(subscription => subscription.unsubscribe())
            }
        })

        const names = []
        for (let name in sources) {
            if (!Object.prototype.hasOwnProperty.call(sources, name)) return
            names.push(name)
        }
        this.name = `{${
            names.map(name => ((sources[name] && !sources[name].name && sources[name].name !== name) ? `${name}: ${sources[name].name}` : name)).join(', ')
            }}`
    }
}
