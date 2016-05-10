import {
    Data,
    View,
    Debounce,
    Domain,
    Dispatcher,
    dispatch,
} from '../src';

function fulfillsReactorInterface(instance) {
    expect(typeof instance.read).toBe('function');
    expect(typeof instance.subscribe).toBe('function');
    expect(typeof instance.appendReactor).toBe('function');
    expect(typeof instance.map).toBe('function');
}

describe('Immview', () => {
    describe('has public interface', () => {
        it('Data', () => {
            expect(Data).toBeDefined();
            const d = new Data();
            fulfillsReactorInterface(d);
            expect(typeof d.write).toBe('function');
        });
        it('View', () => {
            expect(View).toBeDefined();
            const v = new View();
            fulfillsReactorInterface(v);
        });
        it('Debounce', () => {
            expect(Debounce).toBeDefined();
            const v = new View();
            const instance = new Debounce(v);
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
        });
        it('dispatch', () => {
            expect(dispatch).toBeDefined();
        });
    });
});
