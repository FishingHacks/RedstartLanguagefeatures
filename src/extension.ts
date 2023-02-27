import * as vscode from 'vscode';

const modules = [
    '@build/c',
    '@build/cpp',
    '@build/generic',
    '@build/typescript',
    '@git/fetch',
    '@git/gitignore',
    '@init/typescript',
    '@install/node',
    '@run/node',
    '@test/js',
    'echo',
];

let myStatusBarItem: vscode.StatusBarItem;

export function activate({ subscriptions }: vscode.ExtensionContext) {
    subscriptions.push(
        vscode.languages.registerCompletionItemProvider('rsproj', {
            provideCompletionItems: function provider(
                document: vscode.TextDocument,
                position: vscode.Position
            ) {
                const text = document
                    .lineAt(position)
                    .text.substring(0, position.character)
                    .split(/[ \n]/g);
                const _text = document.getText(
                    new vscode.Range(new vscode.Position(0, 0), position)
                );
                const a = _text.lastIndexOf('settings {');
                const word = text[text.length - 1];
                if (a !== -1 && a >= _text.lastIndexOf('}')) {
                    return ['cwd', 'dbgprint']
                        .filter((el) => el.startsWith(word))
                        .map(
                            (el) =>
                                new vscode.CompletionItem(
                                    el,
                                    vscode.CompletionItemKind.Variable
                                )
                        );
                }

                return modules
                    .filter((el) => el.replace('@', '').startsWith(word))
                    .map(
                        (el) =>
                            new vscode.CompletionItem(
                                el,
                                vscode.CompletionItemKind.Method
                            )
                    );
            },
        })
    );

    const myCommandId = 'sample.showSelectionCount';
    subscriptions.push(
        vscode.commands.registerCommand(myCommandId, () => {
            const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
            vscode.window.showInformationMessage(
                `Yeah, ${n} line(s) selected... Keep going!`
            );
        })
    );

    // create a new status bar item that we can now manage
    myStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    myStatusBarItem.command = myCommandId;
    subscriptions.push(myStatusBarItem);

    // register some listener that make sure the status bar
    // item always up-to-date
    subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
    );
    subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem)
    );

    // update status bar item once at start
    updateStatusBarItem();
}

function updateStatusBarItem(): void {
    const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
    if (n > 0) {
        myStatusBarItem.text = `$(megaphone) ${n} line(s) selected`;
        myStatusBarItem.show();
    } else {
        myStatusBarItem.hide();
    }
}

function getNumberOfSelectedLines(
    editor: vscode.TextEditor | undefined
): number {
    let lines = 0;
    if (editor) {
        lines = editor.selections.reduce(
            (prev, curr) => prev + (curr.end.line - curr.start.line),
            0
        );
    }
    return lines;
}
