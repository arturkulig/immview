const { Domain, Observable, diagnose } = window.immview
diagnose.on()

new Observable(function test1(observer) {
    observer.next(1)
    observer.next(2)
    observer.next(function customNext() { return 2 })
})
    .map(function transformNumsToStrings(v) {
        return v + ''
    })

Domain.create(
    Observable.of(1, 2).merge(Observable.of(3, 4)).map(v => v + ''),
    {
        testAction() {}
    }
).testAction()