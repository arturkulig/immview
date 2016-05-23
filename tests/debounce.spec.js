import { Data, View, Domain, Debounce } from '../src';

describe('Debounce', () => {

    beforeEach(function () {
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
    });

    it('initializes itself', () => {
        const source = new Data('i');
        const debounced = new Debounce(source, 10);
        expect(debounced.read()).toBe('i');
    });

    it('debounces one hit', () => {
        const source = new Data('i');
        const debounced = new Debounce(source, 10);

        source.write('j');
        expect(debounced.read()).toBe('i');

        jasmine.clock().tick(11);
        expect(debounced.read()).toBe('j');
    });

    it('debounces two hits', () => {
        const source = new Data(1);
        const debounced = new Debounce(source, 10);

        source.write(2);
        jasmine.clock().tick(6);
        expect(debounced.read()).toBe(1);

        source.write(3);
        jasmine.clock().tick(6);
        expect(debounced.read()).toBe(1);

        jasmine.clock().tick(6);
        expect(debounced.read()).toBe(3);
    });

    it('can be created from a Data', () => {
        const source = new Data(1);
        const debounced = source.debounce(10);
        expect(debounced.read()).toBe(1);
    });

    it('can be created from a View', () => {
        const source = new Data(1);
        const derivative = source.map();
        const debounced = derivative.debounce(10);
        expect(debounced.read()).toBe(1);
    });

    it('can be created from a Domain', () => {
        const source = new Data(1);
        const domain = new Domain(source, {});
        const debounced = domain.debounce(10);
        expect(debounced.read()).toBe(1);
    });

    it('can be destroyed', done => {
        const source = new Data(1);
        const debounced = source.debounce(10);
        expect(() => debounced.destroy()).not.toThrow();
        done();
    });
});
