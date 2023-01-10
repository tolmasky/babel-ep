const ArrayIsArray = Array.isArray;

const { VISITOR_KEYS } = require("@babel/types");


module.exports = (f, start, node) =>
    !node ? start :
    ArrayIsArray(node) ? node.reduce(f, start) :
    VISITOR_KEYS[node.type]
        .reduce((accum, key) => f(accum, node[key], key), start);
