import {
    Dispatcher,
    Data,
    View,
} from '../src';

const standardTicker = Dispatcher.tick;

describe('switching dispatcher ticker', () => {

    beforeEach(() => {
        jasmine.clock().install();
        Dispatcher.tick = f => setTimeout(() => {
            setTimeout(f, 10);
        });
    });

    afterEach(() => {
        jasmine.clock().tick(40);
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

        jasmine.clock().tick(40);

        expect(A.read()).toBe('b');
        expect(B.read()).toBe('b!');
    });
});
