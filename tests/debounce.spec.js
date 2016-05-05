import { Data, View, Domain, Debounce } from '../src';

describe('Debounce', () => {
    let timeouts = [];
    let timeouted = [];
    beforeEach(() => {
        window._setTimeout = window.setTimeout;
        window._clearTimeout = window.clearTimeout;
        timeouts = [];
        timeouted = [];
        window.setTimeout = (f, t) => {
            timeouts.push(t);
            timeouted.push(f);
            return timeouted.length;
        };
        window.clearTimeout = id => {
            timeouted = timeouted.filter((f, idx) => idx !== id - 1);
        };
        window.flushTimeout = () => {
            timeouted.forEach(f => f());
            timeouted = [];
        };
    });
    afterEach(() => {
        window.setTimeout = window._setTimeout;
        window.clearTimeout = window._clearTimeout;
    });
    it('can be tested', () => {
        let testValue = 0;
        window.setTimeout(() => {
            testValue += 1;
        }, 100);
        window.flushTimeout();
        expect(timeouts).toEqual([100]);
        expect(testValue).toBe(1);

        let defered = window.setTimeout(() => {
            testValue += 1;
        }, 100);
        window.clearTimeout(defered);
        window.flushTimeout();
        expect(testValue).toBe(1);
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
        expect(timeouts).toEqual([10]);
        expect(debounced.read()).toBe('i');

        window.flushTimeout();
        expect(timeouts).toEqual([10]);
        expect(debounced.read()).toBe('j');
    });

    it('debounces two hits', () => {
        const source = new Data(1);
        const debounced = new Debounce(source, 10);

        source.write(2);
        expect(timeouts).toEqual([10]);
        expect(debounced.read()).toBe(1);

        source.write(3);
        expect(timeouts).toEqual([10, 10]);
        expect(debounced.read()).toBe(1);

        window.flushTimeout();
        expect(timeouts).toEqual([10, 10]);
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
        debounced.destroy();
        done();
    });
});
