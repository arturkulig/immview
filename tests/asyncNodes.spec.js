import {
    Data,
    View,
} from '../src';

describe('Async nodes', () => {
    describe('return a promise instead of value:', () => {
        it('Data - value', done => {
            const testNode = new Data(0);
            testNode.subscribe(v => {
                if (v === 1) {
                    done();
                }
            });
            testNode.write(Promise.resolve(1));
        });
        it('Data - func', done => {
            const testNode = new Data(0);
            testNode.subscribe(v => {
                if (v === 1) {
                    done();
                }
            });
            testNode.write(() => Promise.resolve(1));
        });
        it('View', done => {
            const testDataNode = new Data(0);
            const testViewNode = new View(
                testDataNode,
                v => new Promise(
                    resolve => setTimeout(() => {
                        resolve(v);
                    })
                )
            );
            testViewNode.subscribe(
                v => {
                    if (v === 1) {
                        done();
                    }
                }
            );
            testDataNode.write(1);
        });
    });
    it('arrange all values in or without Promise in order of process execution', done => {
        const testNode = new Data(0);
        const values = [];
        testNode.subscribe(v => {
            values.push(v);
            if (values.length === 6) {
                expect(values).toEqual([0, 1, 2, 3, 4, 5]);
                done();
            }
        });
        testNode.write(Promise.resolve(1));
        testNode.write(2);
        testNode.write(() => new Promise(resolve => setTimeout(() => resolve(3))));
        testNode.write(new Promise(resolve => setImmediate(() => resolve(4))));
        testNode.write(5);
    });
});
