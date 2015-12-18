describe('View', function() {
    var {Data, View} = immview;
    var I = Immutable;

    function getData() {
        return new Data({a:1, b:{c:2}});
    }

    var d;
    var v;
    var vReactions;

    beforeEach(() => {
        d = getData();
        vReactions = 0;
        v = new View(d, state => {
            vReactions++;
            return state.set('d', 3);
        });
    });

    it('can be created', function() {
        expect(v.isView).toBe(true);
    });

    it('can be read from / is a result of processing data', function() {
        expect(v.get('a')).toBe(1);
        expect(v.get('d')).toBe(3);
    });

    it('cannot be written to', function() {
        expect(()=>v.set('a', 1)).toThrow();
    });

    it('is reacting to new data', function() {
        expect(v.get('a')).toBe(1);
        expect(v.get('d')).toBe(3);
        expect(v.get('e')).toBeUndefined();
        d.set('e', 4);
        expect(v.get('a')).toBe(1);
        expect(v.get('d')).toBe(3);
        expect(v.get('e')).toBe(4);
    });

    it('reacts only to actual changes', function() {
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

    describe('derives from multiple reactors', function() {
        it('w/o processor func', function() {
            var d1 = new Data({a:1});
            var d2 = new Data({a:2});
            var v2 = new View({d1, d2});
            expect(v2.getIn(['d1', 'a'])).toBe(1);
            expect(v2.getIn(['d2', 'a'])).toBe(2);
            d2.set('a', 3);
            expect(v2.getIn(['d2', 'a'])).toBe(3);
        });

        it('with processor func', function() {
            var d1 = new Data({a:1});
            var d2 = new Data({a:2});
            var v2 = new View({d1, d2}, data => {
                return I.Map({
                    a: data.get('d1'),
                    b: data.get('d2'),
                });
            });
            expect(v2.getIn(['a', 'a'])).toBe(1);
            expect(v2.getIn(['b', 'a'])).toBe(2);
            d2.set('a', 3);
            expect(v2.getIn(['b', 'a'])).toBe(3);
        });

    });
});
