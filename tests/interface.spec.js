import {
    Data,
    View,
    Debounce,
    Throttle,
    Scan,
    Domain,
    Dispatcher,
    dispatch,
} from '../src';

function fulfillsReactorInterface(instance) {
    expect(typeof instance.read).toBe('function');
    expect(typeof instance.subscribe).toBe('function');
    expect(typeof instance.addSubscription).toBe('function');
    expect(typeof instance.map).toBe('function');
    expect(typeof instance.debounce).toBe('function');
    expect(typeof instance.throttle).toBe('function');
    expect(typeof instance.scan).toBe('function');
    expect(typeof instance.reduce).toBe('function');
}

describe('Immview', () => {
    describe('keeps public interface in', () => {
        it('Data', () => {
            expect(Data).toBeDefined();
            const d = new Data();
            fulfillsReactorInterface(d);
            expect(typeof d.write).toBe('function');
        });
        it('View', () => {
            expect(View).toBeDefined();
            const d = new Data();
            const v = new View(d);
            const v2 = new View({ d });
            fulfillsReactorInterface(v);
            fulfillsReactorInterface(v2);
        });
        it('Debounce', () => {
            expect(Debounce).toBeDefined();
            const d = new Data();
            const v = new View(d);
            const instance = new Debounce(v);
            fulfillsReactorInterface(instance);
        });
        it('Throttle', () => {
            expect(Throttle).toBeDefined();
            const d = new Data();
            const v = new View(d);
            const instance = new Throttle(v);
            fulfillsReactorInterface(instance);
        });
        it('Scan', () => {
            expect(Scan).toBeDefined();
            const d = new Data();
            const v = new View(d);
            const instance = new Scan(v);
            fulfillsReactorInterface(instance);
        });
        it('Domain', () => {
            expect(Domain).toBeDefined();
            const testData = new Data();
            const testDomain = new Domain(testData);
            fulfillsReactorInterface(testDomain);
        });
        it('Dispatcher', () => {
            expect(Dispatcher).toBeDefined();
            expect(Dispatcher.dispatch).toBeDefined();
            expect(Dispatcher.rejectContext).toBeDefined();
            expect(Dispatcher.logger).toBeDefined();
        });
        it('dispatch', () => {
            expect(dispatch).toBeDefined();
        });
    });
});
