import * as vscode from 'vscode';
import { LaravelGenerateHelperExtension } from './LaravelGenerateHelperExtension';

export function activate(context: vscode.ExtensionContext) {
	const extension = new LaravelGenerateHelperExtension(context);
	extension.activate();

	let disposable = vscode.commands.registerCommand('laravel-generate-helper.generate', () => {
		extension.runGenerate();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('laravel-generate-helper.generateModelHelper', () => {
		extension.runLaravelIdeHelperModel();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('laravel-generate-helper.generateFormRequestPHPDoc', () => {
		extension.runGenerateFormRequestPhpDoc();
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
