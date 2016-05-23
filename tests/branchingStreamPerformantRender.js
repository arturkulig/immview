import { Data, View } from '../src';

describe('branching and merged streams', () => {
    it('are causing only single rerender of child stream', () => {
        const start = new Data(1);
        const branch1 = new View(start, d => d * 10);
        const branch2a = new View(start, d => d * 100);
        const branch3a = new View(start, d => d * 1000);
        const branch2b = new View({
            branch2a,
            branch3a,
        }, data => data.get('branch2a') + data.get('branch3a'));
        const branch3b = new View(branch3a, d => d * 10000);
        const end = new View({
            branch1,
            branch2b,
            branch3b,
        }, data =>
            data.get('branch1') +
            data.get('branch2b') +
            data.get('branch3b')
        );

        let hits = 0;
        let output;

        end.subscribe(v => {
            output = v;
            hits++;
        });
        expect(hits).toBe(1);

        start.write(2);
        expect(hits).toBe(2);
        expect(output).toBe(20002220);
    });
});
