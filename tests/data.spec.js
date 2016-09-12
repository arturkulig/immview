import Data from '../src/Data';
import { dispatch } from '../src/Dispatcher';
import {
    Map,
    fromJS,
} from 'immutable';

describe('Data', () => {

    let testDataObject;

    beforeEach(() => {
        testDataObject = new Data(Map({ a: 1, b: Map({ c: 2 }) }));
    });

    it('can be created', () => {
        expect(!!testDataObject.subscribe).toBe(true);
    });

    describe('can be created with a boolean value', () => {
        const boolDataTest = (startWith) => {
            const dataForBool = new Data(startWith);
            expect(dataForBool.read()).toBe(startWith);
            dataForBool.write(v => !v);
            expect(dataForBool.read()).toBe(!startWith);
        };
        it('T', boolDataTest.bind(null, true));
        it('F', boolDataTest.bind(null, false));
    });

    describe('can be created with a number', () => {
        const numberDataTest = (startWith) => {
            const dataForNumber = new Data(startWith);
            expect(dataForNumber.read()).toBe(startWith);
            dataForNumber.write(startWith + 1);
            expect(dataForNumber.read()).toBe(startWith + 1);
        };
        it('2', numberDataTest.bind(null, 2));
        it('0', numberDataTest.bind(null, 0));
        it('-1', numberDataTest.bind(null, -1));
    });

    it('can be created with a string', () => {
        const dataForString = new Data(' 2 ');
        expect(dataForString.read()).toBe(' 2 ');
        dataForString.write(' 3 ');
        expect(dataForString.read()).toEqual(' 3 ');
    });

    it('can be created with an object', () => {
        const dataForObject = new Data({ test: 1 });
        expect(dataForObject.read()).toEqual({ test: 1 });
        dataForObject.write({ test: 2 });
        expect(dataForObject.read()).toEqual({ test: 2 });
    });

    it('can be created with an array', () => {
        const dataForObject = new Data([2, 3, 4]);
        expect(dataForObject.read()).toEqual([2, 3, 4]);
        dataForObject.write([2, 3, 4, 5]);
        expect(dataForObject.read()).toEqual([2, 3, 4, 5]);
    });

    it('can be read from', () => {
        expect(testDataObject.read().get('a')).toBe(1);
        expect(testDataObject.read().getIn(['b', 'c'])).toBe(2);
        expect(testDataObject.read().toJS()).toEqual({ a: 1, b: { c: 2 } });
    });

    it('can be written to with a new data', () => {
        testDataObject.write(testDataObject.read().setIn(['b', 'c'], 3));
        testDataObject.write(testDataObject.read().set('d', 3));
        expect(testDataObject.read().getIn(['b', 'c'])).toBe(3);
        expect(testDataObject.read().get('d')).toBe(3);
    });

    it('can be written to with a function returning data', () => {
        testDataObject.write(v => v.setIn(['b', 'c'], 3));
        testDataObject.write(v => v.set('d', 3));
        expect(testDataObject.read().getIn(['b', 'c'])).toBe(3);
        expect(testDataObject.read().get('d')).toBe(3);
    });

    it('can be subscribed to', done => {
        let forthVal;

        testDataObject.subscribe(state => {
            expect(state.get('a')).toBe(1);
            expect(state.get('d')).toBe(forthVal);
            if (forthVal) {
                setTimeout(done);
            }
        });

        forthVal = 3;
        testDataObject.write(testDataObject.read().set('d', forthVal));
    });

    it('triggers reaction only for actual change', () => {

        let reactions = 0;

        const d = new Data(fromJS({ a: 1, b: { c: 2 } }));

        d.subscribe(() => {
            reactions++;
        });

        expect(reactions).toBe(1); // subscription -> fake reaction
        d.write(map => map.set('d', 3)); // change -> reaction
        expect(reactions).toBe(2);
        d.write(map => map); // no change -> no reaction
        expect(reactions).toBe(2);
        d.write(map => map.set('d', 4)); // change -> reaction
        expect(reactions).toBe(3);
    });

    it('can be unsubscribed from', () => {
        let reactions = 0;
        const unsub = testDataObject.subscribe(() => {
            reactions++;
        });

        testDataObject.write(testDataObject.read().set('d', 3)); // change -> reaction
        expect(reactions).toBe(2);

        unsub(); // halt reactions

        testDataObject.write(testDataObject.read().set('d', 5)); // change -> no reaction
        expect(reactions).toBe(2);
    });

    it('can create a View by map function', () => {
        let reactions = 0;
        testDataObject.map(dData => {
            reactions += dData.get('a');
        });

        testDataObject.write(testDataObject.read().set('d', 3)); // change -> reaction
        expect(reactions).toBe(2);
    });

    it('writes can still be queued up and all performed', () => {
        const a = new Data(0);
        const b = new Data(0);
        expect(a.read()).toBe(0);
        expect(b.read()).toBe(0);
        a.write(i => {
            // they are inside so they are actually queued
            b.write(i => i + 1);
            b.write(i => i + 1);

            // as they are queued, updates are not yet performed
            expect(a.read()).toBe(0);
            expect(b.read()).toBe(0);
            return i + 1;
        });
        expect(a.read()).toBe(1);
        expect(b.read()).toBe(2);
    });

    describe('can be destroyed', () => {
        it('and ignores writes', done => {
            const a = new Data(0);
            dispatch(() => {
                a.destroy();
                a.write(1);
            });
            dispatch(() => {
                expect(a.read()).toBe(null);
            });
            dispatch(() => setTimeout(done, 0));
        });
        it('and rejects pending writes', done => {
            const a = new Data(0);
            dispatch(() => {
                a.write(() => {
                    throw new Error('should not happen');
                });
                a.destroy();
            });
            dispatch(() => {
                expect(a.read()).toBe(null);
            });
            dispatch(() => setTimeout(done, 0));
        });
    });
});
