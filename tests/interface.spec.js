import {
    Data,
    View,
    Domain,
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
        it('Domain', () => {
            expect(Domain).toBeDefined();
            const testData = new Data();
            const testDomain = new Domain(testData);
            fulfillsReactorInterface(testDomain);
        });
    });
});
