import Domain from '../src/Domain';
import Data from '../src/Data';
import View from '../src/View';

describe('Domain', () => {
    it('exists', () => {
        expect(typeof Domain).toBeTruthy();
    });

    it('cannot be created from non-Reactor type', () => {
        expect(() => {
            new Domain({});
        }).toThrow();
    });

    it('can be created from Data type', () => {
        const d = new Data({ a: 1 });

        // this should be really tested here
        // so it is just informative
        expect(d.read().get('a')).toBe(1);

        const dmn = new Domain(d);
        expect(dmn.read().get('a')).toBe(1);
    });

    it('can be created from a View type', () => {
        const d = new Data({ a: 1 });

        const v = new View(d, data => data);
        expect(d.read().get('a')).toBe(1);

        const dmn2 = new Domain(v);
        expect(dmn2.read().get('a')).toBe(1);
    });

    it('acquire queueable methods', () => {
        let testVar = '';
        const d = new Data({ a: 1 });
        const dmn = new Domain(d, {
            testMethod1: () => {
                testVar += '1';
            },

            testMethod2: () => {
                dmn.testMethod1();
                testVar += '2';
                dmn.testMethod1();
            },
        });

        dmn.testMethod2();

        // would be 121 if they were not queueable
        expect(testVar).toBe('211');
    });

    it('allow subscriptions', () => {
        let testVar = 0;
        const d = new Data({ a: 1 });
        const dmn = new Domain(d);

        expect(testVar).toBe(0);

        dmn.subscribe(processData => {
            testVar += processData.get('a');
        });

        expect(testVar).toBe(1);

        d.write(v => v.set('a', 2));

        expect(testVar).toBe(3);
    });

    it('can be destroyed mid-digest', () => {
        let testVar = '';
        const d = new Data({ a: 1 });
        const dmn = new Domain(d, {
            testMethod1: () => {
                testVar += '1';
            },

            testMethod2: () => {
                testVar += '2';
                dmn.testMethod1();
                dmn.destroy();
            },

            testMethod3: () => {
                dmn.testMethod2();
                testVar += '3';
            },
        });

        dmn.testMethod3();
        dmn.testMethod1();

        // would be 3211 if they were not destroyed
        expect(testVar).toBe('32');
    });
});
