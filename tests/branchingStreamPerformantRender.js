import { Data, View, Domain, dispatch } from '../src';

describe('branching and merged streams', () => {
    it('are causing only single rerender of child stream', () => {
        const start = new Data(1);
        const branch1 = new View(start, d => d * 10);
        const branch2a = new View(start, d => d * 100);
        const branch3a = new View(start, d => d * 1000);
        const branch3aDomain = new Domain(branch3a);
        const branch2b = new Domain(new View({
            branch2a,
            branch3a,
        }, data => data.get('branch2a') + data.get('branch3a')));
        const branch3b = new View(branch3aDomain, d => d * 10000);
        const constantStream = new Data(2);
        const end = new View({
            branch1,
            branch2b,
            branch3b,
            constantStream,
        }, data =>
            data.get('branch1') +
            data.get('branch2b') +
            data.get('branch3b') +
            data.get('constantStream')
        );

        let hits = 0;
        let output = 0;

        end.subscribe(v => {
            output = v;
            hits++;
        });
        expect(hits).toBe(1);

        start.write(2);
        expect(hits).toBe(2);
        expect(output).toBe(20002222);
    });

    it('is reacting once to two dispatched write jobs affecting single child node', () => {
        const parent1 = new Data(1);
        const parent2 = new Data(2);
        let hits = [];
        new View(
            { parent1, parent2 },
            data => hits.push([
                data.get('parent1'),
                data.get('parent2'),
            ])
        );
        dispatch(() => {
            parent1.write(11);
            parent2.write(22);
        });

        // 1 - initial, 2 - rerender, 3+ - unnecessary
        expect(hits.length).toBe(2);
    });
});
