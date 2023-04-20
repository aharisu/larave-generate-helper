import { Block } from "php-parser";
import { Class } from "php-parser";
import { Namespace } from "php-parser";
import { Node } from "php-parser";
import { Engine } from "php-parser";

export function getClassNameFromCode(code: string): string | null {
    const parser = new Engine({
        parser: {
            extractDoc: false,
            php7: true,
        },
    });

    const ast = parser.parseCode(code, "unknown");
    const namespaceNode = findNodeByKind<Namespace>(ast,'namespace');
    const classNode = findNodeByKind<Class>(ast, 'class');
    if(namespaceNode && classNode) {
        let name = classNode.name;
        if(typeof name !== 'string') {
            name = name.name;
        }

        return namespaceNode.name + '\\' + name;
    }

    return null;
}

function findNodeByKind<T extends Node>(ast: Node, kind: string): T | null {
    if (ast.kind === kind) {
        return ast as T;
    }

    if (isBlock(ast)) {
        for (const child of ast.children) {
            const found = findNodeByKind(child, kind);
            if (found !== null) {
                return found as T;
            }
        }
    }

    return null;
}

function isBlock(node: Node): node is Block {
    return node.hasOwnProperty('children');
}