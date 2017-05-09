# What's the difference between `Atom` and `Observable` classes?

Both `Atom` and `Observable` look very similar at first glance,
but they really have very different purpose.

`Atom` is encapsulated observable state value.

`Observable` is encapsulated stream of messages, 
that is: values that are relevant only at time of their publishing.

Let's have this as an example:

```javascript
import {Atom, Observable} from "immview"

const a$ = new Atom('-')
a$.next('first')
a$.next('second')
a$.subscribe(v => console.log(`A  ${v}`))
    // logs: A  second
a$.subscribe(v => console.log(`A2 ${v}`))
    // logs: A2 second
a$.next('third')
    // logs: A  third
    // logs: A2 third

const o$ = new Observable(({next}) => {next('-')})
o$.next('first')
o$.next('second')
o$.subscribe(v => console.log(`O  ${v}`))
    // logs: O  -
    // logs: O  first
    // logs: O  second
o$.subscribe(v => console.log(`O2 ${v}`))
o$.next('third')
    // logs: O  third
    // logs: O2 third

log.join('\n')
```

> see that running live on https://runkit.com/arturkulig/immview-atom-observable-difference

As you can see first few values pushed through the `a$ (Atom)` **are lost**.
This is because these previous values are not that `Atom`'s state anymore. It will allow reading it's value to every subscriber and will notify these subscribers if state changes, but it is not a message queue, so previous states are not relevant.

`Observable` on the other hand is just **a message queue**. No message is lost and all queued messages are dispatched to subscribers as soon as possible. You can make sure that all subscriptions are created by the time first value is pushed, so all of them are notified of all messages, but that is up to a library user, it might not be important after all.

## Where to use which?

Different nature of both of these streaming primitives may be still unclear? More real-life example might be of use.

Consider connectivity through HTTP tooling prepared with `Immview`. In case you want to broadcast structures that inform about fetching status of different resources you'd use an `Observable`, but if you wish to maintain a registry of requesting and finally - content of  every requested remote resource - you'd prefer an `Atom` for the job.

You might as well have both! First an `Observable` that just broadcasts requests status and then an `Atom` (might be even in different `Domain`) that reduces these messages to a single structure that contains information about all resources.
