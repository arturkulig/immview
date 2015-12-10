describe('Data', function() {
    var {Data} = immview;
    function getData() {
        return new Data({a:1, b:{c:2}});
    }

    var d;

    beforeEach(()=>d = getData());

    it('can be created', function() {
        expect(d.isData).toBe(true);
    });

    it('can be read from', function() {
        expect(d.get('a')).toBe(1);
        expect(d.getIn(['b', 'c'])).toBe(2);
    });

    it('can be written to', function() {
        d.set('d', 3);
        expect(d.get('d')).toBe(3);
    });

    it('can be subscribed to', function(done) {
        setTimeout(()=> {
            var v = d.subscribe(state => {
              expect(state.get('a')).toBe(1);
              expect(state.get('d')).toBe(3);
              done();
            });
            d.set('d',3);
        });
    });
});
