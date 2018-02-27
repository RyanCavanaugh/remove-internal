import ts = require('typescript');

export type Result = {
    result: string;
    count: number;
}

export function elide(data: string): Result {
    const sourceFile = ts.createSourceFile("input.d.ts", data, ts.ScriptTarget.Latest, true);
    const elisions: [number, number][] = [];
    sourceFile.forEachChild(visit);
    const count = elisions.length;

    let result = data;
    while (elisions.length > 0) {
        const e = elisions.pop()!;
        result = result.substr(0, e[0]) + result.substr(e[1]);
    }
    return { result, count };

    function visit(node: ts.Node) {
        if (isElidableOrTraversable(node)) {
            const trivia = node.getFullText().substr(0, node.getLeadingTriviaWidth());
            if (trivia.indexOf('@internal') >= 0) {
                elisions.push([node.getFullStart(), node.getEnd()]);
            } else {
                node.forEachChild(visit);
            }
        }
    }
}

function isElidableOrTraversable(node: ts.Node) {
    switch (node.kind) {
        case ts.SyntaxKind.EnumMember:
        case ts.SyntaxKind.EnumDeclaration:
        case ts.SyntaxKind.IndexSignature:
        case ts.SyntaxKind.ConstructSignature:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.MethodSignature:
        case ts.SyntaxKind.FunctionDeclaration:
        case ts.SyntaxKind.PropertyDeclaration:
        case ts.SyntaxKind.ClassDeclaration:
        case ts.SyntaxKind.InterfaceDeclaration:
        case ts.SyntaxKind.ModuleDeclaration:
        case ts.SyntaxKind.ModuleBlock:
        case ts.SyntaxKind.TypeLiteral:
        case ts.SyntaxKind.SyntaxList:
            return true;
    }
    return false;
}
