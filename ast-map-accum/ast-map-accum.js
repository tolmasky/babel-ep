const given = f => f();
const ASTReduce = require("@babel-eps/ast-reduce");

const ObjectAssign = Object.assign;
const ArrayIsArray = Array.isArray;
const ObjectIs = Object.is || ((lhs, rhs) =>
    x === y ?
        x !== 0 || 1 / x === 1 / y :
        x !== x && y !== y);


module.exports = (f, start, node) => given((
    [accum, mappings] = ASTReduce(
        ([accum, mappings], node, key) => given((
            [faccum, mapped] = f(accum, node, key)) =>
            [
                faccum,
                ObjectIs (mapped, node) ?
                    mappings :
                    ObjectAssign(mappings, { [key]: mapped })
            ]),
        [start, false],
        node)) =>
[
    accum,
    !mappings ?
        node :
        ArrayIsArray(node) ?
            ObjectAssign(node.slice(), mappings) :
            { ...node, ...mappings }
]);
