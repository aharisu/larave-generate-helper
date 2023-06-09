import * as vscode from 'vscode';
import { getClassNameFromCode, getExtendsClassNameFromCode } from './PhpParser';
import { exec } from 'child_process';
import { ExecOptions } from 'child_process';
import path = require('path');
import { getConfiguration } from './configuration';

const shellescape = require('shell-escape');

export class LaravelGenerateHelperExtension {
    private name = 'LaravelGenerateHelper';
    private outputChannel: vscode.OutputChannel;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.outputChannel = vscode.window.createOutputChannel(this.name);
    }

    public activate() {
        this.showOutput("activate");
    }

    private showOutput(message: string) {
        this.outputChannel.appendLine(message);
    }

    private showInformationMessage(message: string, kind: 'info' | 'error' = 'info') {
        this.showOutput(message);
        if(kind === 'error') {
            vscode.window.showErrorMessage(message);
        } else {
            vscode.window.showInformationMessage(message);
        }
    }

    public runGenerate() {
		const activeEditor = vscode.window.activeTextEditor;
		if(!activeEditor) {
            this.showInformationMessage('No active editor', 'error');
			return;
		}

        const code = activeEditor.document.getText();
        const extendsClassName = getExtendsClassNameFromCode(code);
        if (extendsClassName === null) {
            this.showInformationMessage('PHP extends class name not found', 'error');
            return;
        }

        if (extendsClassName.includes("Request")) {
            this.runGenerateFormRequestPhpDoc();
        } else if(extendsClassName.includes("Model")) {
            this.runLaravelIdeHelperModel();
        } else {
            this.showInformationMessage('unknown file', 'error');
        }
    }

    public runLaravelIdeHelperModel() {
		const activeEditor = vscode.window.activeTextEditor;
		if(!activeEditor) {
            this.showInformationMessage('No active editor', 'error');
			return;
		}
        const className = getClassNameFromCode(activeEditor.document.getText());
        if(className === null) {
            this.showInformationMessage('PHP class name not found', 'error');
			return;
        }

        const args = getConfiguration().get<string>('ide-helper-args') ?? "";

        this.runArtisanCommand("ide-helper:models", [className, args]);
    }

    public runGenerateFormRequestPhpDoc() {
		const activeEditor = vscode.window.activeTextEditor;
		if(!activeEditor) {
            this.showInformationMessage('No active editor', 'error');
			return;
		}

        const args = getConfiguration().get<string>('generate-form-request-phpdoc-args') ?? "";

        const fileName = activeEditor.document.fileName;
        const relative = this.getWorkspaceRelativePath(fileName);
        this.runArtisanCommand("form-request:generate", [relative, args]);
    }


    private runArtisanCommand(command: string, args: string[] = []) {
        const artisanCommand = getConfiguration().get<string>('artisan-command') ?? "";
        const cmd = `${artisanCommand} ${command} ${shellescape(args)}`;

        const options: ExecOptions = { };
        //コマンドを実行する際のカレントディレクトリをプロジェクトのルートに設定する
        const workspaceFolder = this.getWorkspaceFolder();
        if(workspaceFolder !== null) {
            options.cwd = workspaceFolder;
        }

        exec(cmd, options, (error, stdout, stderr) => {
            if(error) {
                this.showInformationMessage("Error:\n" + error, "error");
            }
            if(stdout) {
                this.showOutput("stdout:\n" + stdout);
            }
            if(stderr) {
                this.showInformationMessage("stderr:\n" + stderr, "error");
            }
        });
    }

    private getWorkspaceFolder(): string | null {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if(!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }
        return workspaceFolders[0].uri.fsPath;
    }

    private getWorkspaceRelativePath(fileName: string): string {
        const workspaceFolder = this.getWorkspaceFolder();
        if(workspaceFolder === null) {
            return fileName;
        }

        return path.relative(workspaceFolder, fileName);
    }
}