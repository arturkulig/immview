import { Data, View, Domain, dispatch } from '../src';

describe('branching and merged streams', () => {
    it('are causing only single rerender of child stream', () => {
        let processHits = 0;
        let outputHits = 0;
        let output = 0;

        const start = new Data(1);
        const branch1 = new View(start, d => d * 10);
        const branch2a = new View(start, d => d * 100);
        const branch3a = new View(start, d => d * 1000);
        const branch3aDomain = new Domain(branch3a);
        const branch2b = new Domain(new View({
            branch2a,
            branch3a,
        }, data => {
            return data.get('branch2a') + data.get('branch3a');
        }));
        const branch3b = new View(branch3aDomain, d => d * 10000);
        const constantStream = new Data(2);
        const end = new View({
            branch1,
            branch2b,
            branch3b,
            constantStream,
        }, data => {
            processHits++;

            return data.get('branch1') +
                data.get('branch2b') +
                data.get('branch3b') +
                data.get('constantStream');
        });

        end.subscribe(v => {
            output = v;
            outputHits++;
        });

        expect(processHits).toBe(1);
        expect(outputHits).toBe(1);

        start.write(2);

        expect(processHits).toBe(2);
        expect(outputHits).toBe(2);
        expect(output).toBe(20002222);
    });

    it('is reacting once to two dispatched write jobs affecting single child node', () => {
        const parent1 = new Data(1);
        const parent2 = new Data(2);
        let hits = [];
        new View(
            ({ parent1, parent2 }),
            ({ parent1, parent2 }) => hits.push([
                parent1,
                parent2,
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
