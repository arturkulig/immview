/**
 * Returns nodes order from last node to root element(s)
 * @param edges
 * @returns {Array}
 */
export function getOrder(edges) {
    const result = getAllNodes(edges).reduce(
        (currentResult, node) => {
            if (isIn(currentResult.visited, node)) {
                return currentResult;
            }
            return getOrderStartingFromNode(edges, node, currentResult);
        },
        {
            visited: [],
            stack: [],
        }
    );
    return result.stack;
}

export function getAllNodes(edges) {
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

export function getOrderStartingFromNode(edges, node, visitedNodesResult) {
    const childNodesResult = getNodeChildren(edges, node).reduce(
        (currentResult, childNode) => {
            if (isIn(currentResult.visited, childNode)) {
                return currentResult;
            }
            return getOrderStartingFromNode(
                edges,
                childNode,
                currentResult
            );
        },
        {
            visited: visitedNodesResult.visited.concat([node]),
            stack: visitedNodesResult.stack,
        }
    );
    const givenNodeResult = {
        visited: childNodesResult.visited,
        stack: childNodesResult.stack.concat([node]),
    };
    return givenNodeResult;
}

function isIn(list, element) {
    return list.indexOf(element) >= 0;
}

export function getNodeChildren(edges, node) {
    return edges.filter(edge => edge[0] === node).map(edge => edge[1]);
}
