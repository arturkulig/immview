import Domain from '../src/Domain';
import Data from '../src/Data';
import View from '../src/View';
import {
    Map,
    fromJS,
} from 'immutable';

describe('View', function () {

    it('can be created from a Data', function () {
        var aData = new Data(Map({ a: 1 }));
        var resultView = new View(aData, i=>i);
        expect(resultView.read().get('a')).toBe(1);
    });

    it('can be created from a View', function () {
        var aData = new Data(Map({ a: 1 }));
        var aView = new View(aData, i=>i);
        var resultView = new View(aView, i=>i);
        expect(resultView.read().get('a')).toBe(1);
    });

    it('can be created from a Domain', function () {
        var aData = new Data(Map({ a: 1 }));
        var aView = new View(aData, i=>i);
        var aDomain = new Domain(aView, {});
        var resultView = new View(aDomain, i=>i);
        expect(resultView.read().get('a')).toBe(1);
    });

    it('can be created from a Domains', function () {
        var aData = new Data(Map({ a: 1 }));
        var aView = new View(aData, i=>i);
        var aDomain = new Domain(aView, {});
        var resultView = new View({ aD: aDomain }, i=>i);
        expect(resultView.read().getIn(['aD', 'a'])).toBe(1);
    });

    describe('', function () {
        var d;
        var v;
        var vReactions;

        beforeEach(() => {
            d = new Data(fromJS({ a: 1, b: { c: 2 } }));
            vReactions = 0;
            v = new View(d, state => {
                vReactions++;
                return state.set('d', 3);
            });
        });

        it('can be read from / is a result of processing data', function () {
            expect(v.read().get('a')).toBe(1);
            expect(v.read().get('d')).toBe(3);
        });

        it('cannot be written to', function () {
            expect(() => v.write(v => v.set('a', 1))).toThrow();
        });

        it('is reacting to new data', function () {
            expect(v.read().toJS()).toEqual({ a: 1, b: { c: 2 }, d: 3 });
            d.write(v => v.set('e', 4));
            expect(v.read().toJS()).toEqual({ a: 1, b: { c: 2 }, d: 3, e: 4 });
        });

        describe('derives from multiple reactors', function () {
            it('w/o processor func', function () {
                var d1 = new Data(Map({ a: 1 }));
                var d2 = new Data(Map({ a: 2 }));
                var v2 = new View({ d1, d2 });
                expect(v2.read().toJS()).toEqual({
                    d1: { a: 1 },
                    d2: { a: 2 },
                });
                d2.write(v => v.set('a', 3));
                expect(v2.read().toJS()).toEqual({
                    d1: { a: 1 },
                    d2: { a: 3 },
                });
            });

            it('with processor func', function () {
                var d1 = new Data(Map({ a: 1 }));
                var d2 = new Data(Map({ a: 2 }));
                var v2 = new View({ d1, d2 }, data => {
                    expect(data.get('d1')).toBeDefined();
                    expect(data.get('d2')).toBeDefined();
                    return Map({
                        a: data.get('d1'),
                        b: data.get('d2'),
                    });
                });
                expect(v2.read().toJS()).toEqual({
                    a: { a: 1 },
                    b: { a: 2 },
                });
                d2.write(v => v.set('a', 3));
                expect(v2.read().toJS()).toEqual({
                    a: { a: 1 },
                    b: { a: 3 },
                });
            });

        });
    });

    it('creates new View deriving from current with \'map\' functions', done => {
        new Domain(new Data(Map({ a: 1 })), {})
            .map(data => data.set('b', 2)) // <- view from data
            .map(data => data.setIn(['c'], 3)) // <- view from view
            .subscribe(data => {
                expect(data.get('a')).toBe(1);
                expect(data.get('b')).toBe(2);
                expect(data.get('c')).toBe(3);
                done();
            });
    });
});
