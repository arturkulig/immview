import {
    addEdge,
    getOrder,
    getGraphNodes,
    getNodeChildren,
    visit,
} from '../src/graphSort.js';

function addEdges(edges) {
    let graph;
    edges.forEach(edge => {
        graph = addEdge(edge[0], edge[1], graph);
    });
    return graph;
}

describe('graphsort', () => {
    it('can add edge to empty graph', () => {
        expect(
            addEdge('a', 'b').toJS()
        ).toEqual([['a','b']]);
    });
    it('can add edge to filled graph', () => {
        const edges = [
            ['a', 'b'],
            ['a', 'c'],
        ];
        const graph = addEdges(edges);
        expect(graph.toJS()).toEqual(edges);
    });
    it('can get nodes', () => {
        const edges = [
            ['a', 'b'],
            ['a', 'c'],
        ];
        const graph = addEdges(edges);
        expect(getGraphNodes(graph).toJS()).toEqual(['a', 'b', 'c']);
    });
    it('can get node children', () => {
        const edges = [
            ['a', 'b'],
            ['a', 'd'],
            ['e', 'a'],
            ['a', 'c'],
        ];
        const graph = addEdges(edges);
        const result = getNodeChildren(graph, 'a');
        expect(result.toJS()).toEqual(['b', 'd', 'c']);
    });
    it('can visit a node', () => {
        const edges = [
            ['c', 'f'],
            ['a', 'b'],
            ['a', 'd'],
            ['d', 'c'],
            ['e', 'a'],
        ];
        const graph = addEdges(edges);
        const result = visit(graph, 'a');
        expect(result.stack.toJS()).toEqual(['b', 'f', 'c', 'd', 'a']);
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
        const graph = addEdges(edges);
        const stack = getOrder(graph);

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
    })
});
