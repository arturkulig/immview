import {
    addEdge,
    getOrder,
    getGraphNodes,
    getNodeChildren,
    visit,
} from '../src/Graph.js';

describe('graphsort', () => {
    it('can get nodes', () => {
        expect(getGraphNodes([
            ['a', 'c'],
        ])).toEqual(['a', 'c']);
        expect(getGraphNodes([
            ['a', 'b'],
            ['a', 'c'],
        ])).toEqual(['a', 'b', 'c']);
        expect(getGraphNodes([
            ['a', 'b'],
            ['a', 'c'],
            ['e', 'f'],
        ])).toEqual(['a', 'b', 'c', 'e', 'f']);
    });

    it('can get node children', () => {
        const edges = [
            ['a', 'b'],
            ['a', 'd'],
            ['e', 'a'],
            ['a', 'c'],
        ];
        const result = getNodeChildren(edges, 'a');
        expect(result).toEqual(['b', 'd', 'c']);
    });

    it('can visit a node', () => {
        const edges = [
            ['c', 'f'],
            ['a', 'b'],
            ['a', 'd'],
            ['d', 'c'],
            ['e', 'a'],
        ];
        const result = visit(edges, 'a', [], []);
        expect(result.stack).toEqual(['b', 'f', 'c', 'd', 'a']);
    });

    it('can sort graph nodes', () => {
        const edges = [
            ['c', 'f'],
            ['a', 'b'],
            ['a', 'd'],
            ['g', 'e'],
            ['h', 'e'],
            ['d', 'c'],
            ['e', 'a'],
        ];
        const stack = getOrder(edges);

        expect(stack.length).toBe(8);

        const compare = ([shouldBeHigher, shouldBeLower]) => {
            expect(
                stack.indexOf(shouldBeHigher) > stack.indexOf(shouldBeLower)
            ).toBe(true);
        };
        [
            ['h', 'a'],
            ['a', 'c'],
            ['e', 'd'],
            ['e', 'c'],
        ].forEach(compare);
    });
});
