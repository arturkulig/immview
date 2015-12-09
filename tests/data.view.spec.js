describe('masterview', function() {
    var {Data} = immview;
    function getData() {
        return new Data({a:1, b:{c:2}});
    }

    it('can be created', function() {
        var d = getData();
        expect(d.isData).toBe(true);
    });

    it('can be read from', function() {
        var d = getData();
        expect(d.get('a')).toBe(1);
        expect(d.getIn(['b', 'c'])).toBe(2);
    });

    it('can be written to', function() {
        var d = getData();
        d.set('d', 3);
        expect(d.get('d')).toBe(3);
    });
});
