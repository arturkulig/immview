import { Observable } from './Observable'

export class Merge<T extends Object> extends Observable<T> {
    constructor(sources: { [id: string]: Observable<any> }) {
        super(observer => {
            const names: string[] = []
            const initialized: string[] = []

            let preinitialReceivedMessages: [string, any][] = []
            let result: T = ({} as T)

            const subscriptions = []
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
                            let initialMessage: T = ({} as T)
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
                                } as T))
                            })
                            preinitialReceivedMessages = null
                            return
                        }

                        observer.next(result = ({
                            ...(result as {}),
                            [key]: nextSourceValue
                        } as T))
                    })
                )
            }

            return () => {
                subscriptions.forEach(subscription => subscription())
            }
        })
    }
}
