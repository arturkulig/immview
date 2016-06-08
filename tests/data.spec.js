import Data from '../src/Data';
import * as I from 'immutable';

describe('Data', () => {

    let testDataObject;

    beforeEach(() => {
        testDataObject = new Data(I.Map({ a: 1, b: I.Map({ c: 2 }) }));
    });

    it('can be created', () => {
        expect(!!testDataObject.subscribe).toBe(true);
    });

    it('can be created with a number', () => {
        const dataFromNumber = new Data(2);
        expect(dataFromNumber.read()).toBe(2);
        dataFromNumber.write(3);
        expect(dataFromNumber.read()).toEqual(3);
    });

    it('can be created with a string', () => {
        const dataFromString = new Data(' 2 ');
        expect(dataFromString.read()).toBe(' 2 ');
        dataFromString.write(' 3 ');
        expect(dataFromString.read()).toEqual(' 3 ');
    });

    it('can be created with an object', () => {
        const dataFromObject = new Data({ test: 1 });
        expect(dataFromObject.read()).toEqual({ test: 1 });
        dataFromObject.write({ test: 2 });
        expect(dataFromObject.read()).toEqual({ test: 2 });
    });

    it('can be created with an array', () => {
        const dataFromObject = new Data([2, 3, 4]);
        expect(dataFromObject.read()).toEqual([2, 3, 4]);
        dataFromObject.write([2, 3, 4, 5]);
        expect(dataFromObject.read()).toEqual([2, 3, 4, 5]);
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

        const getDataMap = () => I.fromJS({ a: 1, b: { c: 2 } });

        const d = new Data(getDataMap());

        d.subscribe(() => {
            reactions++;
        });

        expect(reactions).toBe(1); // subscription -> fake reaction
        d.write(getDataMap().set('d', 3)); // change -> reaction
        expect(reactions).toBe(2);
        d.write(getDataMap().set('d', 3)); // no change -> no reaction
        expect(reactions).toBe(2);
        d.write(getDataMap().set('d', 4)); // change -> reaction
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
        a.write(i => {
            b.write(i => i + 1);
            b.write(i => i + 1);
            return i + 1;
        });
        expect(a.read()).toBe(1);
        expect(b.read()).toBe(2);
    });
});
