const given = f => f();
const plugin = require("@babel-eps/custom-parser-plugin");


module.exports = plugin `intrinsics` ((babel, superclass) => given((
    { types: t } = babel,
    tt = Object.fromEntries(Object
        .keys(babel.tokTypes)
        .map((name, index) => [name, index])),
    tokenIsIdentifier = token => token >= tt._as && token <= tt.name) =>
    class extends superclass
    {
        parseIntrinsic ()
        {
            if (!this.match(tt.modulo))
                return false;
    
            const { start } = this.state;
            // let the `loc` of Identifier starts from `%`
            const node = this.startNode();
            this.next(); // eat '%'
    
            if (!tokenIsIdentifier(this.state.type))
                return this.unexpected(start);
    
            const keyPath = [this.parseIdentifierName(this.state.start)];
    
            while (this.eat(tt.dot))
                keyPath.push(this.parseIntrinsicMember());
    
            this.expect(tt.modulo);
    
            return Object.assign(
                this.finishNode(node, "Identifier"),
                { name: keyPath.join("."), intrinsic: true, keyPath });
        }
    
        parseIntrinsicMember()
        {
            const isFieldEntry = this.eat(tt.bracketL);
    
            if (isFieldEntry)
                this.expect(tt.bracketL);
    
            const name = this.parseIdentifierName(this.state.start);
    
            if (isFieldEntry)
            {
                this.expect(tt.bracketR);
                this.expect(tt.bracketR);
            }
    
            return isFieldEntry ? `[[${name}]]` : name;
        }
    
        parseIdentifier(liberal)
        {
            return !liberal || !this.match(tt.modulo) ?
                super.parseIdentifier(liberal) :
                this.parseIntrinsic();
        }
    
        parseExprAtom() 
        {
            return this.parseIntrinsic() || super.parseExprAtom(...arguments);
        }
    }));
