import {
    List,
    OrderedSet,
    Set,
    is,
} from 'immutable';

export function addEdge(from, to, edges = OrderedSet()) {
    return edges.add(List([from, to]));
}

export function getGraphNodes(edges) {
    return edges.reduce(
        (result, edge) =>
            result
                .add(edge.get(0))
                .add(edge.get(1)),
        OrderedSet()
    );
}

export function getOrder(edges) {
    let visited;
    let stack;
    getGraphNodes(edges).forEach(node => {
        if (!visited || !visited.has(node)) {
            const result = visit(edges, node, stack, visited);
            visited = result.visited;
            stack = result.stack;
        }
    });
    return stack.toList();
}

export function visit(edges, node, stack = OrderedSet(), visited = Set()) {
    let tmpVisited = visited.add(node);
    let tmpStack = stack;
    getNodeChildren(edges, node).forEach(childNode => {
        const result = visit(edges, childNode, tmpStack, tmpVisited);
        tmpVisited = result.visited;
        tmpStack = result.stack;
    });
    return {
        stack: tmpStack.add(node),
        visited: tmpVisited,
    };
}

export function getNodeChildren(edges, node) {
    return edges.filter(edge => is(edge.get(0), node)).map(edge => edge.get(1));
}
