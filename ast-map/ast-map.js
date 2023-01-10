const ASTMapAccum = require("@babel-eps/ast-map-accum");

module.exports = (f, node) =>
    ASTMapAccum((_, node, key) => [false, f(node, key)], false, node)[1];
