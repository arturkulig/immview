import {
    Dispatcher,
    Data,
    View,
} from '../src';

describe('switching dispatcher ticker', () => {
    const standardTicker = Dispatcher.tick;
    beforeEach(() => {
        Dispatcher.tick = f => setTimeout(() => {
            setTimeout(f, 10);
        });
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
        Dispatcher.tick = standardTicker;
    });

    it('works', () => {
        const A = new Data('a');
        const B = new View(A, str => str + '!');
        expect(A.read()).toBe('a');
        expect(B.read()).toBe('a!');

        A.write('b');
        expect(A.read()).toBe('a');
        expect(B.read()).toBe('a!');

        jasmine.clock().tick(20);
        jasmine.clock().tick(20);
        expect(A.read()).toBe('b');
        expect(B.read()).toBe('b!');
    });
});
