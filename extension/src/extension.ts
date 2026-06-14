import * as vscode from 'vscode';
import { DesignGuardianPanel } from './DesignGuardianPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('DesignGuardian AI extension is now active!');

    // Helper to get code and filename from the active text editor
    function getActiveEditorDetails() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('DesignGuardian: No active file open. Please open a code component first.');
            return null;
        }

        const document = editor.document;
        const selection = editor.selection;
        const code = selection.isEmpty 
            ? document.getText() 
            : document.getText(selection);
            
        return {
            code,
            fileName: document.fileName,
            editor
        };
    }

    // 1. Audit Component Command
    let auditDisposable = vscode.commands.registerCommand('extension.audit', async () => {
        const details = getActiveEditorDetails();
        if (!details) {return;}
        
        const panel = DesignGuardianPanel.createOrShow(context.extensionUri);
        await panel.triggerAudit(details.code, details.fileName);
    });

    // 2. Auto Fix Component Command
    let autoFixDisposable = vscode.commands.registerCommand('extension.autoFix', async () => {
        const details = getActiveEditorDetails();
        if (!details) {return;}

        const panel = DesignGuardianPanel.createOrShow(context.extensionUri);
        await panel.triggerAutoFix(details.code, details.fileName);
    });

    // 3. Show Design Score Command
    let showScoreDisposable = vscode.commands.registerCommand('extension.showScore', async () => {
        const details = getActiveEditorDetails();
        if (!details) {return;}

        const panel = DesignGuardianPanel.createOrShow(context.extensionUri);
        await panel.triggerShowScore(details.code, details.fileName);
    });

    // 4. Generate Design DNA Command
    let generateDNADisposable = vscode.commands.registerCommand('extension.generateDNA', async () => {
        const details = getActiveEditorDetails();
        if (!details) {return;}

        const panel = DesignGuardianPanel.createOrShow(context.extensionUri);
        await panel.triggerGenerateDNA(details.code, details.fileName);
    });

    // 5. Detect Design Drift Command
    let detectDriftDisposable = vscode.commands.registerCommand('extension.detectDrift', async () => {
        const details = getActiveEditorDetails();
        if (!details) {return;}

        const panel = DesignGuardianPanel.createOrShow(context.extensionUri);
        await panel.triggerDetectDrift(details.code, details.fileName);
    });

    // 6. Generate Governance Report Command
    let generateReportDisposable = vscode.commands.registerCommand('extension.generateReport', async () => {
        const details = getActiveEditorDetails();
        if (!details) {return;}

        const panel = DesignGuardianPanel.createOrShow(context.extensionUri);
        await panel.triggerGenerateReport();
    });

    context.subscriptions.push(
        auditDisposable,
        autoFixDisposable,
        showScoreDisposable,
        generateDNADisposable,
        detectDriftDisposable,
        generateReportDisposable
    );
}

export function deactivate() {
    if (DesignGuardianPanel.currentPanel) {
        DesignGuardianPanel.currentPanel.dispose();
    }
}
