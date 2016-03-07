import Queue from '../src/Queue.js';
import Data from '../src/Data';
import * as I from 'immutable';

describe('Data', function () {

    var d;

    beforeEach(()=> {
        d = new Data({ a: 1, b: { c: 2 } });
    });

    it('can be created', function () {
        expect(d.isData).toBe(true);
    });

    it('can be read from', function () {
        expect(d.read().get('a')).toBe(1);
        expect(d.read().getIn(['b', 'c'])).toBe(2);
        expect(d.read().toJS()).toEqual({ a: 1, b: { c: 2 } });
    });

    it('can be written to with a new data', function () {
        d.write(d.read().setIn(['b', 'c'], 3));
        d.write(d.read().set('d', 3));
        expect(d.read().getIn(['b', 'c'])).toBe(3);
        expect(d.read().get('d')).toBe(3);
    });

    it('can be written to with a new data', function () {
        Queue.appendAndRunQueue(function () {
            //this time both writes will be executed after current command execution
            d.write(d.read().setIn(['b', 'c'], 3));
            d.write(d.read().set('d', 3));
        });

        // with a value only last write
        // requested during one queue command or outside of queue
        // will last
        expect(d.read().getIn(['b', 'c'])).toBe(2);
        expect(d.read().get('d')).toBe(3);
    });

    it('can be written to with a function returning data', function () {
        d.write(v => v.setIn(['b', 'c'], 3));
        d.write(v => v.set('d', 3));
        expect(d.read().getIn(['b', 'c'])).toBe(3);
        expect(d.read().get('d')).toBe(3);
    });

    it('can be subscribed to', function (done) {
        let forthVal;

        d.subscribe(state => {
            expect(state.get('a')).toBe(1);
            expect(state.get('d')).toBe(forthVal);
            if (forthVal) {
                setTimeout(done);
            }
        });

        forthVal = 3;
        d.write(d.read().set('d', forthVal));
    });

    it('triggers reaction only for actual change', function () {

        var reactions = 0;

        var getDataMap = () => I.fromJS({ a: 1, b: { c: 2 } });

        var d = new Data(getDataMap());

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

    it('can be unsubscribed from', function () {
        var reactions = 0;
        var unsub = d.subscribe(() => {
            reactions++;
        });

        d.write(d.read().set('d', 3)); // change -> reaction
        expect(reactions).toBe(2);

        unsub(); // halt reactions

        d.write(d.read().set('d', 5)); // change -> no reaction
        expect(reactions).toBe(2);
    });
});
