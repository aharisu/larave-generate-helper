import { window, workspace } from "vscode";

export function getConfiguration() {
    const document = window.activeTextEditor?.document;
    if(document) {
        return workspace.getConfiguration('laravel-generate-helper', document.uri);
    }

    return workspace.getConfiguration();
}