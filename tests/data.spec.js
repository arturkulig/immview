import Data from '../src/Data';

describe('Data', function () {

    var d;

    beforeEach(()=> {
        d = new Data({ a: 1, b: { c: 2 } });
    });

    it('can be created', function () {
        expect(d.isData).toBe(true);
    });

    it('can be read from', function () {
        expect(d.get('a')).toBe(1);
        expect(d.getIn(['b', 'c'])).toBe(2);
        expect(d.toJS()).toEqual({ a: 1, b: { c: 2 } });
    });

    it('can be written to', function () {
        d.set('d', 3);
        expect(d.get('d')).toBe(3);
    });

    it('can be subscribed to', function (done) {
        let forthVal;

        d.subscribe(state => {
            expect(state.get('a')).toBe(1);
            expect(state.get('d')).toBe(forthVal);
            if (forthVal) {
                done();
            }
        });

        forthVal = 3;
        d.set('d', forthVal);
    });

    it('triggers reaction only for actual change', function () {

        var reactions = 0;
        d.subscribe(() => {
            reactions++;
        });
        expect(reactions).toBe(1); // subscription -> fake reaction
        d.set('d', 3); // change -> reaction
        expect(reactions).toBe(2);
        d.set('d', 3); // no change -> no reaction
        expect(reactions).toBe(2);
        d.set('d', 4); // change -> reaction
        expect(reactions).toBe(3);
    });

    it('can be unsubscribed from', function (done) {
        var reactions = 0;
        var unsub = d.subscribe(() => {
            reactions++;
        });

        d.set('d', 3); // change -> reaction
        expect(reactions).toBe(2);

        unsub(); // halt reactions

        d.set('d', 5); // change -> no reaction
        expect(reactions).toBe(2);

        done();
    });
});
