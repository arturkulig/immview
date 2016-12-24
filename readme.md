# <img src="https://raw.githubusercontent.com/arturkulig/immview/master/immview.png" />

# 2.0 Roadmap
- [ ] Dispatcher
- [ ] Observable base
- [ ] Data
- [ ] Merge
- [ ] Observable.map
- [ ] Observable.buffer
- [ ] Observable.reduce
- [ ] Observable.scan
- [ ] Domain
- [ ] external: immview-react-connect 2.0

Immview is a library to create **Domains** - *non-visual components* - similar to flux stores, exposing their **state** through *observables* pushing data and having specific to them **actions**. It can be used instead of any flux implementation or redux.

State of a **Domain** can be either an *original* data source (**Data**) or a *derivative* data source (**View/Merge/Debounce/Throttle/Scan**). **Views** etc. can be **only** a derivative of other stream (or combination of sources) and eventually use pure transforming function. By connecting these nodes, derivative data source subscribes to all changes of it's source (or sources) and recomputes it's content upon these changes.

If you familiar with stream libraries like Rx\* **Data** can be seen as an original observable and others are transformation functions like `map` effectively producing new observable.
All **Domains** must be provided with a state stream (so either **Data** or a **View**), but not all storages must be assigned to a **Domain**.

## Installation

Immview is registered on NPM.

```bash
npm i immview --save
```

## Presentation

If you are using React to create presentation layer of your app you should check [immview-react-connect](https://github.com/arturkulig/immview-react-connect)

# Read more
* [Reactive logic with immview](https://medium.com/@arturkulig/reactive-logic-with-immview-cf60ff06b7dc) - an introduction to reasoning behind immview
* [Documentation](./docs.md)
* [Simple usage](./usage_simple.md)
* [Changelog](./changelog.md)
