import { Observable } from './Observable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatchPromise } from './DispatcherInstance'
import { diagnose } from './Diagnose'

export interface Actions<T> {
    [id: string]: (this: Domain<T>, ...args: any[]) => void | Promise<any>
}

export class Domain<T> extends Observable<T> {
    constructor(
        stream?: Observable<T>
    ) {
        if (!stream) {
            super()
            return
        }
        super(() => {
            stream.subscribe(this)
        })
    }

    public static tagged(parts: TemplateStringsArray, ...filling: string[]) {
        const creator: typeof Domain.create = (...args) => {
            const instance = Domain.create.apply(undefined, args)
            instance.name = parts.reduce((result, item, i) => result + (i > 0 ? filling[i - 1] : '') + item)
            return instance
        }
        return creator
    }

    public static create<DomainT, ActionsT extends Actions<DomainT>, FieldsT extends {}>(stream: Observable<DomainT>, actions: ActionsT, fields?: FieldsT): Domain<DomainT> & ActionsT & FieldsT
    public static create<DomainT, ActionsT extends Actions<DomainT>, FieldsT extends {}>(actions: ActionsT, fields?: FieldsT): Domain<DomainT> & ActionsT & FieldsT
    public static create<T, U extends Actions<T>, V extends {}>(...args: any[]): Domain<T> & U & V {
        let stream: Observable<T>
        let actions: U
        let fields: V
        if (typeof args[0] === 'object' && args[0] !== null && typeof args[0].subscribe === 'function') {
            stream = args.shift()
        }
        actions = args.shift()
        fields = args.shift()
        const instance = (new Domain(stream) as Object)
        instance['name'] = `[Unnamed domain #${(instance as Domain<T>).priority}]`
        if (actions) {
            for (let actionsKey in actions) {
                const currentActionName = actionsKey
                if (!Object.prototype.hasOwnProperty.call(actions, actionsKey)) {
                    continue
                }
                instance[(actionsKey as string)] =
                    (...args) =>
                        dispatchPromise(() => {
                            const diagDone = diagnose.measure(`<\$ ${instance['name'] ? `${instance['name']}.` : ''}${currentActionName}`)
                            actions[actionsKey].apply(instance, args)
                            diagDone && diagDone()
                        }, DispatcherPriorities.DOMAIN)
            }
        }
        if (fields) {
            for (let fieldsKey in fields) {
                if (!Object.prototype.hasOwnProperty.call(fields, fieldsKey)) {
                    continue
                }
                instance[(fieldsKey as string)] = fields[fieldsKey]
            }
        }
        return (instance as Domain<T> & U & V)
    }
}
