import Domain from '../src/Domain';
import Data from '../src/Data';
import View from '../src/View';
import I from 'immutable';

describe('View', function () {

    it('can be created from a Data', function () {
        var aData = new Data({a: 1});
        var resultView = new View(aData, i=>i);
        expect(resultView.get('a')).toBe(1);
    });

    it('can be created from a View', function () {
        var aData = new Data({a: 1});
        var aView = new View(aData, i=>i);
        var resultView = new View(aView, i=>i);
        expect(resultView.get('a')).toBe(1);
    });

    it('can be created from a Domain', function () {
        var aData = new Data({a: 1});
        var aView = new View(aData, i=>i);
        var aDomain = new Domain(aView, {});
        var resultView = new View(aDomain, i=>i);
        expect(resultView.get('a')).toBe(1);
    });

    describe('', function () {
        var d;
        var v;
        var vReactions;

        beforeEach(() => {
            d = new Data({ a: 1, b: { c: 2 } });
            vReactions = 0;
            v = new View(d, state => {
                vReactions++;
                return state.set('d', 3);
            });
        });

        it('can be read from / is a result of processing data', function () {
            expect(v.get('a')).toBe(1);
            expect(v.get('d')).toBe(3);
        });

        it('cannot be written to', function () {
            expect(()=>v.set('a', 1)).toThrow();
        });

        it('is reacting to new data', function () {
            expect(v.toJS()).toEqual({ a: 1, b: { c: 2 }, d: 3 });
            d.set('e', 4);
            expect(v.toJS()).toEqual({ a: 1, b: { c: 2 }, d: 3, e: 4 });
        });

        it('reacts only to actual changes', function () {
            expect(vReactions).toBe(1);
            d.set('e', 4);
            expect(vReactions).toBe(2);
            d.set('e', 4);
            expect(vReactions).toBe(2);
            d.delete('e');
            expect(vReactions).toBe(3);
            d.delete('e');
            expect(vReactions).toBe(3);
            d.setIn(['e', 'f'], 6);
            expect(vReactions).toBe(4);
            expect(v.getIn(['e', 'f'])).toBe(6);
        });

        describe('derives from multiple reactors', function () {
            it('w/o processor func', function () {
                var d1 = new Data({ a: 1 });
                var d2 = new Data({ a: 2 });
                var v2 = new View({ d1, d2 });
                expect(v2.toJS()).toEqual({
                    d1: { a: 1 },
                    d2: { a: 2 },
                });
                d2.set('a', 3);
                expect(v2.toJS()).toEqual({
                    d1: { a: 1 },
                    d2: { a: 3 },
                });
            });

            it('with processor func', function () {
                var d1 = new Data({ a: 1 });
                var d2 = new Data({ a: 2 });
                var v2 = new View({ d1, d2 }, data => {
                    return I.Map({
                        a: data.get('d1'),
                        b: data.get('d2'),
                    });
                });
                expect(v2.toJS()).toEqual({
                    a: { a: 1 },
                    b: { a: 2 },
                });
                d2.set('a', 3);
                expect(v2.toJS()).toEqual({
                    a: { a: 1 },
                    b: { a: 3 },
                });
            });

        });
    });
});
