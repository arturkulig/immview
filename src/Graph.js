export function getGraphNodes(edges) {
    return edges.reduce(
        (result, edge) => {
            if (result.indexOf(edge[0]) < 0) {
                result.push(edge[0]);
            }
            if (result.indexOf(edge[1]) < 0) {
                result.push(edge[1]);
            }
            return result;
        },
        []
    );
}

export function getOrder(edges) {
    let visited = [];
    let stack = [];
    getGraphNodes(edges).forEach(node => {
        if (!visited || visited.indexOf(node) < 0) {
            const result = visit(edges, node, stack, visited);
            visited = result.visited;
            stack = result.stack;
        }
    });
    return stack;
}

export function visit(edges, node, stack, visited) {
    let tmpVisited = visited.concat([node]);
    let tmpStack = stack;
    getNodeChildren(edges, node).forEach(childNode => {
        if (!tmpVisited || tmpVisited.indexOf(childNode) < 0) {
            const result = visit(edges, childNode, tmpStack, tmpVisited);
            tmpVisited = result.visited;
            tmpStack = result.stack;
        }
    });
    return {
        visited: tmpVisited,
        stack: tmpStack.concat([node]),
    };
}

export function getNodeChildren(edges, node) {
    return edges.filter(edge => edge[0] === node).map(edge => edge[1]);
}
