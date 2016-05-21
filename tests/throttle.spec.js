import { Data, View, Domain, Throttle } from '../src';

describe('Throttle', () => {

    beforeEach(function() {
        jasmine.clock().install();
    });

    afterEach(function() {
        jasmine.clock().uninstall();
    });

    it('initializes itself', () => {
        const source = new Data('i');
        const throttled = new Throttle(source, 10);
        expect(throttled.read()).toBe('i');
    });

    it('debounces one hit', () => {
        const source = new Data('i');
        const throttled = new Throttle(source, 10);

        source.write('j');
        expect(throttled.read()).toBe('i');

        jasmine.clock().tick(11);
        expect(throttled.read()).toBe('j');
    });

    it('throttles with two hits', () => {
        const source = new Data(1);
        const debounced = new Throttle(source, 10);

        source.write(2);
        jasmine.clock().tick(6);
        expect(debounced.read()).toBe(1);

        source.write(3);
        jasmine.clock().tick(6);
        expect(debounced.read()).toBe(3);

        jasmine.clock().tick(6);
        expect(debounced.read()).toBe(3);
    });

    it('can be created from a Data', () => {
        const source = new Data(1);
        const throttled = source.throttle(10);
        expect(throttled.read()).toBe(1);
    });

    it('can be created from a View', () => {
        const source = new Data(1);
        const derivative = source.map();
        const throttled = derivative.throttle(10);
        expect(throttled.read()).toBe(1);
    });

    it('can be created from a Domain', () => {
        const source = new Data(1);
        const domain = new Domain(source, {});
        const throttled = domain.throttle(10);
        expect(throttled.read()).toBe(1);
    });

    it('can be destroyed', done => {
        const source = new Data(1);
        const throttled = source.throttle(10);
        expect(() => throttled.destroy()).not.toThrow();
        done();
    });
});
