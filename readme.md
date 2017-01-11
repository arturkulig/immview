# <img src="https://raw.githubusercontent.com/arturkulig/immview/master/immview.png" />

**Immview** is a library to create `Domain`s - *non-visual components*
- similar to flux stores, exposing their **state** or emitting **signals**
through `Observable`s pushing values and having specific to their concerns **actions**.
Their primary role is to encapsulate a concern
and to be the only thing exported from a javascript module or modules
that deal with the concern.

It completely replaces any flux implementation or Redux.

All `Domain`s must be provided with a single stream of values
(so either `Origin` or any other transformed `Observable`),
but not all `Observable`s must be attached to a `Domain`
 - you can perform many transformations on a source
 before it is exposed through a `Domain`.

### For RxJS users
If you are familiar with RxJS 5, an **Immview** taste of `Observable` does not have a different meaning or role, although behaviour differs and is more similar to RxJS's `Subject`
Also, just as RxJS 5, it mimics [TC39 Observable proposal](https://github.com/tc39/proposal-observable) interface.

## Quick overview

```javascript
const FooSenderDomain = Domain.create(new Observable(), {
  send() {
    this.next('foo')
  }
})

// register observers
FooSenderDomain.subscribe(v => console.log(v))
FooSenderDomain.map(v => v + 'bar').subscribe(v => console.log(v))

FooSenderDomain.send()
// prints: foo
// prints: foobar
```

## Installation

Immview is registered on NPM.

```bash
npm i immview --save
```

## Presentation

If you are using React to create presentation layer of your app you should check [immview-react-connect](https://github.com/arturkulig/immview-react-connect)

# Read more
* [Documentation](./docs.md)
* [Simple usage](./usage_simple.md)
* [Changelog](./changelog.md)
* [Immview — application state management by streaming 101 (Jan 4, 2017)](https://medium.com/@arturkulig/immview-application-state-management-by-streaming-101-c12f81e3abac)
* [Reactive logic with immview (May 28, 2016)](https://medium.com/@arturkulig/reactive-logic-with-immview-cf60ff06b7dc) - an introduction to reasoning behind immview 1.x

# Compatibility

Not compatible with IE8 unless:
- Array.prototype.filter is polyfilled

# 2.0 Roadmap
- [X] Dispatcher
- [X] BaseObservable
- [X] Data -> Origin
- [X] Merge
- [X] Observable.map
- [X] Observable.scan
- [X] Observable.flatten
- [X] Observable.buffer
- [X] Observable.bufferCount
- [X] Domain
- [ ] external: immview-react-connect 2.0
