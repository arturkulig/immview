# [Immview 3](arturkulig.github.io/immview) <img src="https://travis-ci.org/arturkulig/immview.svg?branch=master" />

**Immview** is a library to create `Domain`s - *non-visual components* -
similar to flux stores, exposing their **state** (through `Atom`s) or emitting **signals**
(through `Observable`s) and having specific to their concerns **actions**.
Their primary role is to encapsulate a concern
and to be the only thing exported from a javascript module or modules
that deal with the concern.

It completely replaces any flux implementation or Redux, although surely could be integrated with one easily.

All `Domain`s must be provided with a single stream of values
(`Atom` or `Observable` class instance),
but not all `Observable`s and `Atom`s must be attached to a `Domain` -
you can perform many transformations on a source
before it is exposed through a `Domain`.
These transformations are done with operators -
functions that exist on these classes prototypes.

### TypeScript

**Immview** has been built with TypeScript.
You do not have to use it, but some editors may offer better experience.

<img src="https://raw.githubusercontent.com/arturkulig/immview/master/editor.png" />

### For RxJS users
If you are familiar with RxJS (especially v5), an **Immview** taste of `Observable` does not have a different meaning or role, although behaviour differs slightly as it is more similar to RxJS's `Subject` - you can have many observers for one `Observable` or `Atom`.
Also, just as RxJS 5, it mimics [TC39 Observable proposal](https://github.com/tc39/proposal-observable) interface.

## Quick overview

```javascript
const Foos = new Observable()
const FooSenderDomain = Domain.create(Foos, {
  send() {
    Foos.next('foo')
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

Get it on `npm`

```bash
npm i -S immview
```

or with `yarn`

```bash
yarn add immview
```

## Docs

Visit [arturkulig.github.io/immview](http://arturkulig.github.io/immview/) for documentation.

## Presentation

If you are using React to create presentation layer of your app you should check [immview-react-connect](https://github.com/arturkulig/immview-react-connect)

## Read more
* [Documentation](http://arturkulig.github.io/immview/)
* [Simple usage](./usage_simple.md)
* [Changelog](./changelog.md)

## For 2.x versions
* [Immview — application state management by streaming 101 (Jan 4, 2017)](https://medium.com/@arturkulig/immview-application-state-management-by-streaming-101-c12f81e3abac)
## For 1.x versions
* [Reactive logic with immview (May 28, 2016)](https://medium.com/@arturkulig/reactive-logic-with-immview-cf60ff06b7dc) - an introduction to reasoning behind immview 1.x