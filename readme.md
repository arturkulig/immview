# immview 1.5

Immview is a library to create **Domains** - *non-visual components* - similar to flux stores, exposing their **state** through *observables* pushing immutable data structures and having their own, specific to them **actions**. It can be used in place of any flux implementation, redux.

State of a **Domain** can be either *original* data source (**Data**) or *derivative* data source (**View**). **Views** can be **only** a derivative of other stream (or combination of sources) and optionally use a processing function. By connecting these, derivative data source subscribes to all changes of it's source (or sources) and recomputes it's content upon these changes.

If you familiar with stream libraries like Rx\* **Data** can be seen as an observable and **View** be merging and/or mapping of original stream.
All **Domains** must be provided with a state stream (so either **Data** or a **View**), but not all storages must be assigned to a **Domain**.
State storages (thanks to use of Immutable.js) will only push changes only if actual change is detected.

**Domains** are exposing same interface as Data and View and bypassing method calls to assigned streams.

## Installation

Immview is registered on NPM.

```bash
npm i immview --save
```

## Presentation

If you are using React to create presentation layer of your app you should check [immview-react-connect](https://github.com/arturkulig/immview-react-connect)

# Read more
* [Reactive logic with immview](https://medium.com/@arturkulig/reactive-logic-with-immview-cf60ff06b7dc) - an introduction to reasoning behind immview
* [Introduction to Immutable.js (Auth0 Blog)](https://auth0.com/blog/2016/03/23/intro-to-immutable-js/)
* [Documentation](./docs.md)
* [Simple usage](./usage_simple.md)
* [Changelog](./changelog.md)
