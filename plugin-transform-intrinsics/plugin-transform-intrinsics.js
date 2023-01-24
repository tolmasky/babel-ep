const given = f => f();

const registerSyntaxPlugin = require("./plugin-syntax-intrinsics");

const isIntrinsic = node => node.intrinsic;
const toIntrinsicMemberExpression = (t, name) =>
    t.MemberExpression(t.Identifier("I"), t.StringLiteral(name), true)
const toCallOrApply = (t, receiver, f, arguments) => given((
    isApply = arguments.length === 1 && t.isSpreadElement(arguments[0])) =>
    t.CallExpression(toIntrinsicMemberExpression(t,
        isApply ? "Apply" : "Call"),
        [
            f,
            receiver,
            ...(isApply ? [arguments[0].argument] : arguments)
        ]));
    
const isIntrinsicMemberCall = (t, node) =>
    t.isMemberExpression(node.callee) &&
    isIntrinsic(node.callee.property);


module.exports = babel => given((
    { types: t } = babel) =>
    ({
        manipulateOptions(opts, parserOpts)
        {
            registerSyntaxPlugin(babel);
            parserOpts.plugins.push("intrinsics");
        },
         
        visitor:
        {
            Program: path => path.traverse(
            {
                CallExpression: path => void(
                    isIntrinsicMemberCall(t, path.node) ?
                        path.replaceWith(toCallOrApply(
                            t,
                            path.node.callee.object,
                            path.node.callee.property,
                            path.node.arguments)) :
                        path.node.callee.intrinsic &&
                        path.node.arguments.length === 1 &&
                        t.isSpreadElement(path.node.arguments[0]) &&
                        path.replaceWith(toCallOrApply(
                            t,
                            t.NullLiteral(),
                            path.node.callee,
                            path.node.arguments))),
    
                Identifier: path => void(
                    isIntrinsic(path.node) &&
                    path.replaceWith(
                        toIntrinsicMemberExpression(t, path.node.name)))
            })
        }
    }));
