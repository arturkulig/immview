import {
    Data,
    Reduce
} from '../src';

describe('Reduce', () => {
    it('initializes', () => {
        const testData = new Data(0);
        expect(() => {
            new Reduce(
                testData,
                () => null
            );
        }).not.toThrow();
    });

    describe('not initializes', () => {
        it('without a source', () => {
            expect(() => {
                new Reduce();
            }).toThrow();
        });
        it('without a reducer', () => {
            expect(() => {
                new Reduce(new Data(0));
            }).toThrow();
        });
    });

    describe('reduces', () => {
        it('called with constructor', () => {
            const testData = new Data(0);
            const testReduce = new Reduce(
                testData,
                (result, value) => result + value
            );
            let values = [];
            testReduce.subscribe(
                v => {
                    values.push(v);
                }
            );
            testData.write(1);
            testData.write(2);
            testData.write(3);
            testData.write(4);
            expect(values).toEqual([
                0, 1, 3, 6, 10,
            ]);
        });

        it('called with shorthand function', () => {
            const testData = new Data(0);
            const testReduce = testData.reduce(
                (result, value) => result + value
            );
            let values = [];
            testReduce.subscribe(
                v => {
                    values.push(v);
                }
            );
            testData.write(1);
            testData.write(2);
            testData.write(3);
            testData.write(4);
            expect(values).toEqual([
                0, 1, 3, 6, 10,
            ]);
        });
    });
});
