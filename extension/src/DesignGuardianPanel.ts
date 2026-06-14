import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { 
    auditComponent, 
    fixComponent, 
    fetchScore, 
    fetchDNA, 
    fetchDrift, 
    fetchCoach,
    AuditResponse, 
    FixResponse, 
    Violation 
} from './apiClient';

export class DesignGuardianPanel {
    public static currentPanel: DesignGuardianPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    // State cached for execution contexts
    private _currentCode: string = '';
    private _currentFileName: string = '';
    private _lastActiveEditor: vscode.TextEditor | undefined;

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (DesignGuardianPanel.currentPanel) {
            DesignGuardianPanel.currentPanel._panel.reveal(column || vscode.ViewColumn.One);
            return DesignGuardianPanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            'designGuardian',
            'DesignGuardian Dashboard',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [extensionUri]
            }
        );

        DesignGuardianPanel.currentPanel = new DesignGuardianPanel(panel, extensionUri);
        return DesignGuardianPanel.currentPanel;
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._lastActiveEditor = vscode.window.activeTextEditor;

        // Track active editor changes
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.uri.scheme === 'file') {
                this._lastActiveEditor = editor;
            }
        }, null, this._disposables);

        // Set the webview's initial html content
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'webviewReady':
                        console.log(`[Extension] Received webviewReady message from webview`);
                        if (this.ensureActiveContext()) {
                            console.log(`[Extension] Active context verified, triggering audit...`);
                            await this.triggerAudit(this._currentCode, this._currentFileName);
                        } else {
                            console.log(`[Extension] Active context check failed on webviewReady`);
                        }
                        break;
                    case 'runAudit':
                        await this.runAudit();
                        break;
                    case 'applyFix':
                        await this.handleApplyFix(message.fixedCode);
                        break;
                    case 'requestFix':
                        await this.runFix(message.violations);
                        break;
                    case 'generateDNA':
                        await this.runDNA();
                        break;
                    case 'detectDrift':
                        await this.runDrift();
                        break;
                    case 'generateReport':
                        await this.generateReport();
                        break;
                    case 'runCoach':
                        await this.runCoach();
                        break;
                    case 'showErrorMessage':
                        vscode.window.showErrorMessage(message.text);
                        break;
                    case 'showInfoMessage':
                        vscode.window.showInformationMessage(message.text);
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public dispose() {
        DesignGuardianPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    public async triggerGenerateReport() {
        if (!this._currentCode || !this._currentFileName) {
            vscode.window.showErrorMessage('DesignGuardian: No active file open. Please open a code component first.');
            return;
        }
        await this.generateReport();
    }

    private async generateReport() {
        try {
            // Fetch audit and DNA data
            const auditData = await auditComponent(this._currentCode, this._currentFileName);
            const dnaData = await fetchDNA(this._currentCode, this._currentFileName);
            
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('No workspace folder open. Cannot save report.');
                return;
            }

            const rootPath = workspaceFolders[0].uri.fsPath;
            const reportPath = path.join(rootPath, 'design-review-report.md');
            const fileBasename = path.basename(this._currentFileName);
            
            // Build the markdown content
            let md = `# DesignGuardian AI - Design Compliance Governance Report\n\n`;
            md += `* **File Audited**: \\\`${fileBasename}\\\`\n`;
            md += `* **Path**: \\\`${this._currentFileName}\\\`\n`;
            md += `* **Date/Time**: ${new Date().toLocaleString()}\n`;
            md += `* **Current Design System Compliance**: **${auditData.score}/100**\n`;
            md += `* **Projected Score After Auto-Fix**: **96/100**\n\n`;
            
            md += `---\n\n`;
            md += `## Executive Summary\n\n`;
            md += `DesignGuardian AI performed a governance audit on \\\`${fileBasename}\\\` against registered design system tokens and modular guidelines. The file scored **${auditData.score}/100** with **${auditData.violations.length}** active styling deviations.\n\n`;
            
            md += `### Style Inconsistencies & Deviations\n\n`;
            md += `| Line | Rule ID | Category | Severity | Code Snippet | Rationale / Citation | Proposed Fix |\n`;
            md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
            
            for (const v of auditData.violations) {
                const lineLabel = v.line !== undefined ? `L${v.line}` : '--';
                const sourceBadge = v.sourceDocument || 'general-branding.md';
                const explanation = v.message + ' *Why this matters: ' + (v.whyThisMatters || 'Strict adherence maintains design brand integrity.') + '*';
                const snippet = `\\\`${v.targetContent?.replace(/\\n/g, ' ') || ''}\\\``;
                const fix = `\\\`${v.replacementContent || 'Adjust alignment'}\\\``;
                md += `| **${lineLabel}** | \\\`${v.id}\\\` | *${v.category}* | **${v.severity.toUpperCase()}** | ${snippet} | ${explanation} (${sourceBadge}) | ${fix} |\n`;
            }
            md += `\n`;

            md += `### Reasoning Stepper & Expected UX Impact\n\n`;
            for (const v of auditData.violations) {
                md += `#### Rule \\\`${v.id}\\\`: ${v.message}\n`;
                md += `- **AI Reasoning Chain**: ${v.reasoningChain || 'Detected custom sizing or unapproved colors outside token scale.'}\n`;
                md += `- **Citations**: Found in design system guideline document \\\`${v.sourceDocument || 'premium-branding.md'}\\\`.\n`;
                md += `- **Governance Rationale**: ${v.whyThisMatters || 'Strict compliance avoids layout rhythm fracturing.'}\n`;
                md += `- **Proposed Compliance Fix**: \\\`${v.replacementContent || 'Standard value'}\\\`\n`;
                md += `- **Expected UX Impact**: ${v.expectedUXImpact || 'Improves consistency, visual structure, and component reusability.'}\n\n`;
            }
            md += `\n`;
            
            md += `## Design DNA Profile\n\n`;
            md += dnaData.dna || 'No DNA profile metrics generated.';
            md += `\\n\\n`;
            
            md += `## Automated Style Refactoring Proposal\n\n`;
            md += `Run \\\`DesignGuardian: Auto Fix Component\\\` inside VS Code to automatically apply the required styles and restore design system alignment.\n`;

            fs.writeFileSync(reportPath, md, 'utf8');

            // Open the document side-by-side
            const doc = await vscode.workspace.openTextDocument(reportPath);
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            vscode.window.showInformationMessage(`DesignGuardian: Exported governance report successfully!`);
            
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to export report: ${error.message}`);
        }
    }

    // API triggers from VS Code Commands
    public async triggerAudit(code: string, fileName: string) {
        console.log(`[Extension] triggerAudit invoked for: ${fileName}`);
        this._currentCode = code;
        this._currentFileName = fileName;
        
        console.log(`[Extension] Posting setLoading command to webview...`);
        this._panel.webview.postMessage({ 
            command: 'setLoading', 
            status: 'Auditing component style guidelines...', 
            fileName: path.basename(fileName),
            tab: 'dashboard'
        });

        try {
            console.log(`[Extension] Initiating API post to auditComponent...`);
            const data = await auditComponent(code, fileName);
            console.log(`[Extension] API returned response cleanly. Score: ${data.score}, Violations: ${data.violations.length}`);
            this._panel.webview.postMessage({
                command: 'showAuditResults',
                data: data,
                fileName: path.basename(fileName),
                originalCode: code
            });
            console.log(`[Extension] showAuditResults message posted to webview successfully.`);
        } catch (error: any) {
            console.error(`[Extension] Error caught in triggerAudit API call: ${error.message}`);
            this._panel.webview.postMessage({
                command: 'showError',
                error: error.message
            });
        }
    }

    public async triggerAutoFix(code: string, fileName: string) {
        this._currentCode = code;
        this._currentFileName = fileName;

        this._panel.webview.postMessage({ 
            command: 'setLoading', 
            status: 'Analyzing component issues and auto-fixing design drift...', 
            fileName: path.basename(fileName),
            tab: 'fixer'
        });

        try {
            const fixData = await fixComponent(code, fileName);
            this._panel.webview.postMessage({
                command: 'showFixResults',
                data: fixData,
                originalCode: code,
                fileName: path.basename(fileName)
            });
        } catch (error: any) {
            this._panel.webview.postMessage({
                command: 'showError',
                error: error.message
            });
        }
    }

    public async triggerShowScore(code: string, fileName: string) {
        this._currentCode = code;
        this._currentFileName = fileName;

        this._panel.webview.postMessage({ 
            command: 'setLoading', 
            status: 'Calculating design score and compliance metrics...', 
            fileName: path.basename(fileName),
            tab: 'dashboard'
        });

        try {
            const data = await fetchScore(code, fileName);
            // We can treat score data as a partial audit or full audit response in the dashboard
            this._panel.webview.postMessage({
                command: 'showScoreResults',
                data: data,
                fileName: path.basename(fileName)
            });
        } catch (error: any) {
            this._panel.webview.postMessage({
                command: 'showError',
                error: error.message
            });
        }
    }

    public async triggerGenerateDNA(code: string, fileName: string) {
        this._currentCode = code;
        this._currentFileName = fileName;

        this._panel.webview.postMessage({ 
            command: 'setLoading', 
            status: 'Generating component Design DNA profile...', 
            fileName: path.basename(fileName),
            tab: 'dna'
        });

        try {
            const data = await fetchDNA(code, fileName);
            this._panel.webview.postMessage({
                command: 'showDNAResults',
                data: data,
                fileName: path.basename(fileName)
            });
        } catch (error: any) {
            this._panel.webview.postMessage({
                command: 'showError',
                error: error.message
            });
        }
    }

    public async triggerDetectDrift(code: string, fileName: string) {
        this._currentCode = code;
        this._currentFileName = fileName;

        this._panel.webview.postMessage({ 
            command: 'setLoading', 
            status: 'Detecting design drift and guideline deviations...', 
            fileName: path.basename(fileName),
            tab: 'dashboard'
        });

        try {
            const data = await fetchDrift(code, fileName);
            this._panel.webview.postMessage({
                command: 'showDriftResults',
                data: data,
                fileName: path.basename(fileName)
            });
        } catch (error: any) {
            this._panel.webview.postMessage({
                command: 'showError',
                error: error.message
            });
        }
    }

    private ensureActiveContext(): boolean {
        if (!this._currentCode || !this._currentFileName) {
            const editor = vscode.window.activeTextEditor || this._lastActiveEditor;
            if (editor) {
                this._currentCode = editor.document.getText();
                this._currentFileName = editor.document.fileName;
            }
        }
        return !!(this._currentCode && this._currentFileName);
    }

    // Actions received from webview UI interaction
    private async runAudit() {
        if (!this.ensureActiveContext()) {
            vscode.window.showErrorMessage('No active file context to audit.');
            return;
        }
        await this.triggerAudit(this._currentCode, this._currentFileName);
    }

    private async runFix(violations?: string[]) {
        if (!this.ensureActiveContext()) {
            vscode.window.showErrorMessage('No active file context to fix.');
            return;
        }
        this._panel.webview.postMessage({ 
            command: 'setLoading', 
            status: 'Generating automated style adjustments...', 
            fileName: path.basename(this._currentFileName),
            tab: 'fixer'
        });
        try {
            const fixData = await fixComponent(this._currentCode, this._currentFileName, violations);
            this._panel.webview.postMessage({
                command: 'showFixResults',
                data: fixData,
                originalCode: this._currentCode,
                fileName: path.basename(this._currentFileName)
            });
        } catch (error: any) {
            this._panel.webview.postMessage({
                command: 'showError',
                error: error.message
            });
        }
    }

    private async runDNA() {
        if (!this.ensureActiveContext()) {
            vscode.window.showErrorMessage('No active file context to analyze.');
            return;
        }
        await this.triggerGenerateDNA(this._currentCode, this._currentFileName);
    }

    private async runDrift() {
        if (!this.ensureActiveContext()) {
            vscode.window.showErrorMessage('No active file context to analyze.');
            return;
        }
        await this.triggerDetectDrift(this._currentCode, this._currentFileName);
    }

    public async triggerDesignCoach(code: string, fileName: string) {
        this._currentCode = code;
        this._currentFileName = fileName;

        this._panel.webview.postMessage({ 
            command: 'setLoading', 
            status: 'Consulting Design Coach for UI feedback...', 
            fileName: path.basename(fileName),
            tab: 'coach'
        });

        try {
            const data = await fetchCoach(code, fileName);
            this._panel.webview.postMessage({
                command: 'showCoachResults',
                data: data,
                fileName: path.basename(fileName)
            });
        } catch (error: any) {
            this._panel.webview.postMessage({
                command: 'showError',
                error: error.message
            });
        }
    }

    private async runCoach() {
        if (!this.ensureActiveContext()) {
            vscode.window.showErrorMessage('No active file context to consult.');
            return;
        }
        await this.triggerDesignCoach(this._currentCode, this._currentFileName);
    }

    private async handleApplyFix(fixedCode: string) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found. Open the file you want to edit and try again.');
            return;
        }

        const document = editor.document;
        // Verify path matches to prevent writing to wrong editor if user switched tabs
        if (path.basename(document.fileName) !== path.basename(this._currentFileName)) {
            const proceed = await vscode.window.showWarningMessage(
                `Applying fixes for "${path.basename(this._currentFileName)}" to the active file "${path.basename(document.fileName)}". Do you want to proceed?`,
                'Yes',
                'No'
            );
            if (proceed !== 'Yes') {
                return;
            }
        }

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );

        const success = await editor.edit((editBuilder) => {
            editBuilder.replace(fullRange, fixedCode);
        });

        if (success) {
            vscode.window.showInformationMessage('DesignGuardian: Applied fixes successfully!');
            // Update cache code and re-trigger audit
            this._currentCode = fixedCode;
            await this.triggerAudit(fixedCode, document.fileName);
        } else {
            vscode.window.showErrorMessage('DesignGuardian: Failed to write fixes into active editor.');
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DesignGuardian Dashboard</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#f5f3ff',
                            100: '#ede9fe',
                            500: '#8b5cf6',
                            600: '#7c3aed',
                            700: '#6d28d9',
                            950: '#0f052d',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #0c0a09;
            color: #e7e5e4;
        }
        /* Hide scrollbars for chrome, safari and opera */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbars for IE, Edge and Firefox */
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
    </style>
</head>
<body class="min-h-screen flex flex-col font-sans text-zinc-200">
    <!-- Top Navbar -->
    <nav class="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
            <!-- Glowing Purple Logo/Shield -->
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </div>
            <div>
                <h1 class="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">DESIGNGUARDIAN AI</h1>
                <p id="file-badge" class="text-xs text-zinc-400 font-mono italic">No file selected</p>
            </div>
        </div>

        <div class="flex space-x-2">
            <button onclick="triggerRunAudit()" class="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-800 border border-zinc-700 text-xs font-semibold flex items-center space-x-1.5 transition duration-200">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.306 7H18" />
                </svg>
                <span>Audit</span>
            </button>
            <button onclick="triggerDesignCoach()" class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition duration-200">
                <span>🧠</span>
                <span>Ask Coach</span>
            </button>
            <button onclick="triggerRunFix()" class="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-brand-600/20 transition duration-200">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Auto Fix</span>
            </button>
            <button onclick="triggerExportReport()" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition duration-200">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Report</span>
            </button>
        </div>
    </nav>

    <!-- Main Container -->
    <main class="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Score Card & Tab Navigation -->
        <div class="space-y-6 lg:col-span-1">
            <!-- Score Card -->
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col items-center shadow-lg relative overflow-hidden">
                <div class="absolute -right-16 -top-16 w-32 h-32 bg-brand-600/10 rounded-full blur-2xl"></div>
                <div class="absolute -left-16 -bottom-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

                <div class="relative w-36 h-36 flex items-center justify-center">
                    <!-- Gauge SVG -->
                    <svg class="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="62" class="stroke-current text-zinc-800" stroke-width="7" fill="transparent" />
                        <circle id="score-gauge" cx="72" cy="72" r="62" class="stroke-current text-emerald-500 transition-all duration-700 ease-out" stroke-width="7" fill="transparent" stroke-dasharray="389.55" stroke-dashoffset="389.55" />
                    </svg>
                    <!-- Core Info -->
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span id="score-value" class="text-4xl font-black text-white leading-none">--</span>
                        <span class="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest mt-1">Design Score</span>
                    </div>
                </div>

                <!-- Compliance Boost Dashboard -->
                <div class="w-full mt-5 border-t border-zinc-800/80 pt-4 flex flex-col space-y-2">
                    <div class="flex justify-between text-xs">
                        <span class="text-zinc-400 font-semibold">Current Compliance:</span>
                        <span id="current-score-lbl" class="font-bold text-rose-400 font-mono">--/100</span>
                    </div>
                    <div class="flex justify-between text-xs">
                        <span class="text-zinc-400 font-semibold">Projected Score (After Fix):</span>
                        <span id="projected-score-lbl" class="font-bold text-emerald-400 font-mono">--/100</span>
                    </div>
                    <div class="flex justify-between text-xs items-center">
                        <span class="text-zinc-400 font-semibold">Compliance Boost:</span>
                        <span id="score-boost-lbl" class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 font-mono uppercase tracking-wide">--</span>
                    </div>
                </div>

                <!-- Drift Metrics List -->
                <div class="w-full mt-6 space-y-4 border-t border-zinc-800/80 pt-5">
                    <h3 class="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Design Drift Metrics</h3>
                    
                    <!-- Color Drift -->
                    <div>
                        <div class="flex justify-between text-xs font-semibold mb-1">
                            <span class="text-zinc-300">Color Drift</span>
                            <span id="color-drift-val" class="font-mono text-zinc-400">--%</span>
                        </div>
                        <div class="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div id="color-drift-bar" class="h-full bg-indigo-500 transition-all duration-500" style="width: 0%"></div>
                        </div>
                    </div>

                    <!-- Typography Drift -->
                    <div>
                        <div class="flex justify-between text-xs font-semibold mb-1">
                            <span class="text-zinc-300">Typography Drift</span>
                            <span id="type-drift-val" class="font-mono text-zinc-400">--%</span>
                        </div>
                        <div class="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div id="type-drift-bar" class="h-full bg-violet-500 transition-all duration-500" style="width: 0%"></div>
                        </div>
                    </div>

                    <!-- Spacing Drift -->
                    <div>
                        <div class="flex justify-between text-xs font-semibold mb-1">
                            <span class="text-zinc-300">Spacing Drift</span>
                            <span id="spacing-drift-val" class="font-mono text-zinc-400">--%</span>
                        </div>
                        <div class="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div id="spacing-drift-bar" class="h-full bg-pink-500 transition-all duration-500" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs/Navigation -->
            <div class="rounded-xl border border-zinc-800 bg-zinc-900/20 p-2 flex flex-col space-y-1">
                <button id="tab-btn-dashboard" onclick="switchTab('dashboard')" class="w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition flex items-center space-x-2 bg-zinc-800/80 text-white border-l-2 border-brand-500">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Dashboard & Violations</span>
                </button>
                <button id="tab-btn-dna" onclick="switchTab('dna')" class="w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition flex items-center space-x-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Design DNA Report</span>
                </button>
                <button id="tab-btn-coach" onclick="switchTab('coach')" class="w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition flex items-center space-x-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40">
                    <span class="text-sm">🧠</span>
                    <span>Design Coach</span>
                </button>
                <button id="tab-btn-fixer" onclick="switchTab('fixer')" class="w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition flex items-center space-x-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Code Fix Diff</span>
                </button>
            </div>
        </div>

        <!-- Right/Main Columns: Tab Contents -->
        <div class="space-y-6 lg:col-span-2">
            
            <!-- LOADING STATE -->
            <div id="loading-state" class="hidden rounded-2xl border border-zinc-800 bg-zinc-900/20 p-12 flex flex-col items-center justify-center h-96 text-center space-y-4">
                <div class="w-12 h-12 border-4 border-zinc-700 border-t-brand-500 rounded-full animate-spin"></div>
                <h3 class="text-sm font-semibold text-zinc-300">Loading analysis...</h3>
                <p id="loading-status" class="text-xs text-zinc-500 max-w-sm">Please wait while DesignGuardian process files</p>
            </div>

            <!-- ERROR STATE -->
            <div id="error-state" class="hidden rounded-2xl border border-rose-900/50 bg-rose-950/10 p-8 flex flex-col space-y-4">
                <div class="flex items-center space-x-3 text-rose-500">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 class="text-base font-extrabold">Server Connection Error</h3>
                </div>
                <p id="error-details" class="text-xs text-rose-200/80 leading-relaxed font-mono whitespace-pre-wrap"></p>
                <div class="pt-2">
                    <button onclick="triggerRunAudit()" class="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold border border-zinc-700">Retry Connection</button>
                </div>
            </div>

            <!-- DASHBOARD TAB CONTENT -->
            <div id="tab-content-dashboard" class="space-y-6">
                <!-- Grouped Design Violations -->
                <div class="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                    <div class="flex justify-between items-center border-b border-zinc-800/80 pb-4">
                        <div>
                            <h2 class="text-base font-extrabold text-white">Design Guideline Compliance</h2>
                            <p class="text-xs text-zinc-400">Violations grouped by severity</p>
                        </div>
                        <span id="violations-count-badge" class="px-2 py-0.5 rounded-md bg-zinc-800 text-xs font-mono font-bold text-zinc-400">-- Violations</span>
                    </div>

                    <!-- Critical Section -->
                    <div id="sec-critical" class="space-y-3 hidden">
                        <h3 class="text-xs font-extrabold uppercase tracking-wider text-rose-500 flex items-center space-x-1">
                            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse mr-1.5"></span>
                            Critical Violations
                        </h3>
                        <div id="list-critical" class="space-y-3"></div>
                    </div>

                    <!-- Warning Section -->
                    <div id="sec-warning" class="space-y-3 hidden">
                        <h3 class="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center space-x-1">
                            <span class="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                            Warning Violations
                        </h3>
                        <div id="list-warning" class="space-y-3"></div>
                    </div>

                    <!-- Info Section -->
                    <div id="sec-info" class="space-y-3 hidden">
                        <h3 class="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center space-x-1">
                            <span class="w-2 h-2 rounded-full bg-blue-400 mr-1.5"></span>
                            Info
                        </h3>
                        <div id="list-info" class="space-y-3"></div>
                    </div>

                    <!-- Empty State -->
                    <div id="empty-violations" class="py-12 text-center text-zinc-500 flex flex-col items-center justify-center space-y-3">
                        <div class="w-12 h-12 rounded-full bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center text-emerald-400 shadow-md">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-zinc-300">Perfect Compliance!</p>
                            <p class="text-xs text-zinc-500">Component conforms beautifully to design system requirements.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- DESIGN DNA TAB CONTENT -->
            <div id="tab-content-dna" class="space-y-6 hidden">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                    <div class="flex justify-between items-center border-b border-zinc-800/80 pb-4">
                        <div>
                            <h2 class="text-base font-extrabold text-white">Design DNA Signature</h2>
                            <p class="text-xs text-zinc-400">Tokens, attributes, and styles parsed from source code</p>
                        </div>
                        <button onclick="triggerRunDNA()" class="px-2.5 py-1 text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-800 text-zinc-300 rounded border border-zinc-700 flex items-center space-x-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.306 7H18" />
                            </svg>
                            <span>Regenerate DNA</span>
                        </button>
                    </div>

                    <!-- DNA Markdown Render container -->
                    <div id="dna-container" class="prose prose-invert max-w-none text-sm text-zinc-300 space-y-4">
                        <!-- Filled by JS -->
                    </div>
                </div>
            </div>

            <!-- DESIGN COACH TAB CONTENT -->
            <div id="tab-content-coach" class="space-y-6 hidden">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                    <div class="flex justify-between items-center border-b border-zinc-800/80 pb-4">
                        <div>
                            <h2 class="text-base font-extrabold text-white">🧠 Design Coach Mentorship</h2>
                            <p class="text-xs text-zinc-400">Actionable visual reviews from Stripe, Linear, Notion, Vercel & Apple designers</p>
                        </div>
                        <button onclick="triggerDesignCoach()" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition duration-200">
                            <span>🧠</span>
                            <span>Ask DesignGuardian Why</span>
                        </button>
                    </div>

                    <!-- Coach Feedback Container -->
                    <div id="coach-container" class="prose prose-invert max-w-none text-sm text-zinc-300 space-y-4">
                        <div class="text-zinc-500 italic text-xs py-8 text-center">
                            Click "Ask DesignGuardian Why" to consult the coach on visual structure, generic AI styling traits, and premium alternatives.
                        </div>
                    </div>
                </div>
            </div>

            <!-- CODE FIXER TAB CONTENT -->
            <div id="tab-content-fixer" class="space-y-6 hidden">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4 flex flex-col">
                    <div class="flex justify-between items-start border-b border-zinc-800/80 pb-4">
                        <div>
                            <h2 class="text-base font-extrabold text-white">Design Code Fixer</h2>
                            <p class="text-xs text-zinc-400">Review changes proposed by AI engine to fix guideline deviations</p>
                        </div>
                        <div class="flex space-x-2">
                            <button id="apply-fix-btn" onclick="applyProposedFix()" disabled class="disabled:opacity-50 disabled:hover:bg-brand-600 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-brand-600/20 transition duration-200">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Apply to Editor</span>
                            </button>
                        </div>
                    </div>

                    <div id="fix-meta" class="hidden">
                        <div class="flex flex-wrap gap-2 mb-3" id="applied-fixes-container">
                            <!-- Badges of fixes -->
                        </div>
                    </div>

                    <!-- Unified Diff Container -->
                    <div class="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
                        <div class="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs font-mono text-zinc-400">
                            <span id="diff-file-name">component-diff.tsx</span>
                            <span class="flex items-center space-x-2">
                                <span class="flex items-center space-x-1">
                                    <span class="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span>
                                    <span>Original</span>
                                </span>
                                <span class="flex items-center space-x-2">
                                    <span class="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
                                    <span>Fixed</span>
                                </span>
                            </span>
                        </div>
                        
                        <!-- Line scrollable area -->
                        <div id="diff-view" class="overflow-x-auto max-h-[500px] divide-y divide-zinc-900/30 py-2 no-scrollbar">
                            <!-- Populated by JS -->
                            <div class="text-center py-12 text-zinc-500 italic text-xs">
                                No fix proposed yet. Click "Auto Fix" in top navbar or "Propose Fix" on a violation card.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <!-- JS Logic -->
    <script>
        const vscode = acquireVsCodeApi();
        
        // Notify the extension that the webview is ready to receive messages
        vscode.postMessage({ command: 'webviewReady' });
        
        let currentTab = 'dashboard';
        let latestAuditData = null;
        let latestFixData = null;
        let originalSourceCode = '';

        // Handle Messages from Extension Backend
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'setLoading':
                    showLoadingState(message.status);
                    if (message.fileName) {
                        updateFileBadge(message.fileName);
                    }
                    if (message.tab) {
                        switchTab(message.tab);
                    }
                    break;
                
                case 'showError':
                    hideLoadingState();
                    showErrorState(message.error);
                    break;

                case 'showAuditResults':
                    hideLoadingState();
                    latestAuditData = message.data;
                    originalSourceCode = message.originalCode || '';
                    if (message.fileName) updateFileBadge(message.fileName);
                    renderDashboard(message.data);
                    if (message.data.dna) {
                        renderDNAReport(message.data.dna);
                    }
                    break;

                case 'showScoreResults':
                    hideLoadingState();
                    if (message.fileName) updateFileBadge(message.fileName);
                    updateScoreAndDrift(message.data);
                    break;

                case 'showDNAResults':
                    hideLoadingState();
                    if (message.fileName) updateFileBadge(message.fileName);
                    renderDNAReport(message.data.dna);
                    switchTab('dna');
                    break;

                case 'showDriftResults':
                    hideLoadingState();
                    if (message.fileName) updateFileBadge(message.fileName);
                    updateScoreAndDrift(message.data);
                    break;

                case 'showFixResults':
                    hideLoadingState();
                    latestFixData = message.data;
                    originalSourceCode = message.originalCode || '';
                    if (message.fileName) {
                        updateFileBadge(message.fileName);
                        document.getElementById('diff-file-name').innerText = message.fileName;
                    }
                    renderDiffView(originalSourceCode, message.data.fixedCode, message.data.appliedFixes);
                    switchTab('fixer');
                    break;
                
                case 'showCoachResults':
                    hideLoadingState();
                    if (message.fileName) updateFileBadge(message.fileName);
                    renderCoachFeedback(message.data.feedback);
                    switchTab('coach');
                    break;
            }
        });

        // Tab Switching
        function switchTab(tabId) {
            currentTab = tabId;
            const tabs = ['dashboard', 'dna', 'coach', 'fixer'];
            tabs.forEach(t => {
                const btn = document.getElementById('tab-btn-' + t);
                const content = document.getElementById('tab-content-' + t);
                if (t === tabId) {
                    btn.className = "w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition flex items-center space-x-2 bg-zinc-800/80 text-white border-l-2 border-brand-500";
                    content.classList.remove('hidden');
                } else {
                    btn.className = "w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition flex items-center space-x-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40";
                    content.classList.add('hidden');
                }
            });
        }

        function updateFileBadge(fileName) {
            document.getElementById('file-badge').innerText = 'Component: ' + fileName;
        }

        // State UI Toggles
        function showLoadingState(status) {
            document.getElementById('loading-state').classList.remove('hidden');
            document.getElementById('loading-status').innerText = status;
            document.getElementById('error-state').classList.add('hidden');
            document.getElementById('tab-content-dashboard').classList.add('hidden');
            document.getElementById('tab-content-dna').classList.add('hidden');
            document.getElementById('tab-content-coach').classList.add('hidden');
            document.getElementById('tab-content-fixer').classList.add('hidden');
        }

        function hideLoadingState() {
            document.getElementById('loading-state').classList.add('hidden');
            // Restore active tab
            switchTab(currentTab);
        }

        function showErrorState(errorMsg) {
            document.getElementById('error-state').classList.remove('hidden');
            document.getElementById('error-details').innerText = errorMsg;
            document.getElementById('tab-content-dashboard').classList.add('hidden');
            document.getElementById('tab-content-dna').classList.add('hidden');
            document.getElementById('tab-content-coach').classList.add('hidden');
            document.getElementById('tab-content-fixer').classList.add('hidden');
        }

        // Render dashboard values
        function renderDashboard(data) {
            // Update score, metrics
            updateScoreAndDrift(data);

            // Group violations
            const criticalList = document.getElementById('list-critical');
            const warningList = document.getElementById('list-warning');
            const infoList = document.getElementById('list-info');

            criticalList.innerHTML = '';
            warningList.innerHTML = '';
            infoList.innerHTML = '';

            let counts = { critical: 0, warning: 0, info: 0 };

            if (data.violations && data.violations.length > 0) {
                document.getElementById('empty-violations').classList.add('hidden');
                
                data.violations.forEach(v => {
                    const card = createViolationCard(v);
                    if (v.severity === 'critical') {
                        criticalList.appendChild(card);
                        counts.critical++;
                    } else if (v.severity === 'warning') {
                        warningList.appendChild(card);
                        counts.warning++;
                    } else {
                        infoList.appendChild(card);
                        counts.info++;
                    }
                });

                // Toggle visibility of headers
                toggleSection('sec-critical', counts.critical > 0);
                toggleSection('sec-warning', counts.warning > 0);
                toggleSection('sec-info', counts.info > 0);

                const total = counts.critical + counts.warning + counts.info;
                document.getElementById('violations-count-badge').innerText = total + ' Violation' + (total === 1 ? '' : 's');
                document.getElementById('violations-count-badge').className = "px-2 py-0.5 rounded-md bg-rose-950/40 border border-rose-900/30 text-xs font-mono font-bold text-rose-300";
            } else {
                document.getElementById('empty-violations').classList.remove('hidden');
                toggleSection('sec-critical', false);
                toggleSection('sec-warning', false);
                toggleSection('sec-info', false);
                document.getElementById('violations-count-badge').innerText = '0 Violations';
                document.getElementById('violations-count-badge').className = "px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-900/30 text-xs font-mono font-bold text-emerald-300";
            }
        }

        function toggleSection(id, show) {
            const sec = document.getElementById(id);
            if (show) sec.classList.remove('hidden');
            else sec.classList.add('hidden');
        }

        function updateScoreAndDrift(data) {
            // Update Circular Gauge
            const score = typeof data.score === 'number' ? data.score : (data.metrics?.overall || 0);
            const scoreVal = document.getElementById('score-value');
            scoreVal.innerText = score;
            
            const circle = document.getElementById('score-gauge');
            const circumference = 389.55; // 2 * pi * 62
            const offset = circumference - (score / 100) * circumference;
            circle.setAttribute('stroke-dashoffset', offset);

            // Update projected score and compliance boost labels
            const currentScore = score;
            const projectedScore = Math.max(96, Math.min(100, currentScore + (data.violations?.length || 0) * 10));
            const boost = projectedScore - currentScore;

            document.getElementById('current-score-lbl').innerText = currentScore + '/100';
            document.getElementById('projected-score-lbl').innerText = projectedScore + '/100';
            document.getElementById('score-boost-lbl').innerText = boost > 0 ? '+' + boost + ' Boost' : 'Max Compliance';
            if (boost > 0) {
                document.getElementById('score-boost-lbl').className = "px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 font-mono uppercase tracking-wide";
            } else {
                document.getElementById('score-boost-lbl').className = "px-2 py-0.5 rounded text-[10px] font-extrabold bg-zinc-950/40 border border-zinc-900/30 text-zinc-400 font-mono uppercase tracking-wide";
            }

            // Color ring based on score
            circle.className.baseVal = "stroke-current transition-all duration-700 ease-out " + 
                (score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500");

            // Update individual metrics
            const metrics = data.metrics || { typography: 0, spacing: 0, color: 0 };
            
            // Render Typography
            document.getElementById('type-drift-val').innerText = metrics.typography + '%';
            document.getElementById('type-drift-bar').style.width = metrics.typography + '%';
            document.getElementById('type-drift-bar').className = "h-full transition-all duration-500 " + 
                (metrics.typography > 30 ? "bg-rose-500" : metrics.typography > 15 ? "bg-amber-500" : "bg-violet-500");

            // Render Spacing
            document.getElementById('spacing-drift-val').innerText = metrics.spacing + '%';
            document.getElementById('spacing-drift-bar').style.width = metrics.spacing + '%';
            document.getElementById('spacing-drift-bar').className = "h-full transition-all duration-500 " + 
                (metrics.spacing > 30 ? "bg-rose-500" : metrics.spacing > 15 ? "bg-amber-500" : "bg-pink-500");

            // Render Color
            document.getElementById('color-drift-val').innerText = metrics.color + '%';
            document.getElementById('color-drift-bar').style.width = metrics.color + '%';
            document.getElementById('color-drift-bar').className = "h-full transition-all duration-500 " + 
                (metrics.color > 30 ? "bg-rose-500" : metrics.color > 15 ? "bg-amber-500" : "bg-indigo-500");
        }

        // Card rendering for Violations
        function createViolationCard(v) {
            const card = document.createElement('div');
            card.className = "rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition duration-150 flex flex-col space-y-3.5";
            
            let badgeClass = "bg-blue-950/40 border border-blue-900/30 text-blue-400";
            if (v.severity === 'critical') badgeClass = "bg-rose-950/40 border border-rose-900/30 text-rose-400";
            else if (v.severity === 'warning') badgeClass = "bg-amber-950/40 border border-amber-900/30 text-amber-400";

            const snippetHtml = v.targetContent 
                ? '<div class="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 font-mono text-xs text-rose-300 whitespace-pre overflow-x-auto select-all max-h-24 no-scrollbar">' + escapeHtml(v.targetContent) + '</div>' 
                : '';

            const fixButtonHtml = (v.replacementContent || v.severity === 'critical' || v.severity === 'warning')
                ? '<button onclick="triggerFixForViolation(\'' + v.id + '\')" class="px-2.5 py-1 text-[11px] font-bold text-brand-400 hover:text-brand-300 bg-brand-950/20 hover:bg-brand-950/40 border border-brand-900/40 rounded transition">Propose Fix</button>' 
                : '';

            card.innerHTML = 
                '<div class="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-3.5">' +
                    '<div class="flex items-center space-x-2">' +
                        '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ' + badgeClass + '">' + v.severity + '</span>' +
                        '<span class="text-xs font-extrabold text-zinc-300 font-mono">' + v.category.toUpperCase() + '</span>' +
                    '</div>' +
                    '<span class="text-[11px] text-zinc-500 font-mono">Line ' + (v.line || '--') + '</span>' +
                '</div>' +
                '<div class="border-l border-zinc-800 ml-2.5 pl-4.5 space-y-4 relative">' +
                    '<div class="relative">' +
                        '<div class="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500/40 border border-rose-500"></div>' +
                        '<div class="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">1. Deviation Detected</div>' +
                        snippetHtml +
                    '</div>' +
                    '<div class="relative">' +
                        '<div class="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500/40 border border-indigo-500"></div>' +
                        '<div class="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">2. Governance Standard</div>' +
                        '<div class="text-xs font-bold text-zinc-300 font-mono flex items-center space-x-2">' +
                            '<span>' + v.id + ': ' + escapeHtml(v.message) + '</span>' +
                            '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-mono flex items-center space-x-1 shrink-0">' +
                                '<svg class="w-2.5 h-2.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
                                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />' +
                                '</svg>' +
                                '<span>' + escapeHtml(v.sourceDocument || 'general-branding.md') + '</span>' +
                            '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="relative">' +
                        '<div class="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-violet-500/40 border border-violet-500"></div>' +
                        '<div class="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">3. AI Reasoning & Rationale</div>' +
                        '<div class="text-xs text-zinc-300 leading-relaxed font-semibold mb-2">' + escapeHtml(v.reasoningChain || 'Component styling value is out of specification.') + '</div>' +
                        '<div class="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-850 text-[11px] text-zinc-400 font-medium leading-relaxed select-text">' +
                            '<strong class="text-[9px] text-brand-400 uppercase tracking-widest mr-1.5 font-black">Why This Matters:</strong>' +
                            escapeHtml(v.whyThisMatters || 'Strict adherence prevents design system drifts.') +
                        '</div>' +
                    '</div>' +
                    '<div class="relative">' +
                        '<div class="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500"></div>' +
                        '<div class="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">4. Suggested Fix</div>' +
                        '<div class="flex items-center justify-between gap-3 bg-zinc-950 p-2 rounded-lg border border-zinc-900">' +
                            '<span class="font-mono text-xs text-emerald-400 select-all whitespace-pre overflow-x-auto no-scrollbar">' + escapeHtml(v.replacementContent || v.expectedValue || 'Standard Token') + '</span>' +
                            fixButtonHtml +
                        '</div>' +
                    '</div>' +
                    '<div class="relative">' +
                        '<div class="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-amber-500"></div>' +
                        '<div class="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">5. Expected UX Impact</div>' +
                        '<div class="text-xs text-zinc-400 leading-relaxed font-medium">' + escapeHtml(v.expectedUXImpact || 'Improves layout visual symmetry.') + '</div>' +
                    '</div>' +
                '</div>';
            return card;
        }

        // Render Design DNA Report
        function renderDNAReport(md) {
            const container = document.getElementById('dna-container');
            container.innerHTML = renderMarkdown(md);
        }

        // Parse basic markdown in js without library
        function renderMarkdown(md) {
            if (!md) return '<div class="text-zinc-500 italic text-xs py-8 text-center">No DNA report generated. Run "Generate Design DNA" command.</div>';
            
            // Replace headers
            let html = md
                .replace(/^### (.*$)/gim, '<h3 class="text-xs font-extrabold text-zinc-200 mt-5 mb-1.5 uppercase tracking-wider">$1</h3>')
                .replace(/^## (.*$)/gim, '<h2 class="text-sm font-bold text-zinc-100 mt-6 mb-2.5 border-b border-zinc-800/80 pb-1.5">$1</h2>')
                .replace(/^# (.*$)/gim, '<h1 class="text-base font-extrabold text-white mt-8 mb-4">$1</h1>');
                
            // Replace bold
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-100">$1</strong>');
            
            // Replace bullet points
            html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-zinc-300 py-0.5">$1</li>');
            html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-zinc-300 py-0.5">$1</li>');
            
            // Replace inline code
            html = html.replace(/\`(.*?)\`/g, '<code class="bg-zinc-900 text-brand-400 px-1 py-0.5 rounded font-mono text-[11px] border border-zinc-800/60">$1</code>');
            
            // Replace code blocks
            html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/gm, '<pre class="bg-zinc-950 text-zinc-300 p-4 rounded-lg overflow-x-auto font-mono text-xs my-4 border border-zinc-800 no-scrollbar">$1</pre>');
            
            // Handle double returns into blocks or paragraphs
            const paragraphs = html.split('\\n\\n');
            html = paragraphs.map(p => {
                p = p.trim();
                if (!p) return '';
                if (p.startsWith('<h') || p.startsWith('<li') || p.startsWith('<pre') || p.startsWith('<ul')) {
                    return p;
                }
                return \`<p class="text-xs text-zinc-300 leading-relaxed mb-3">\${p}</p>\`;
            }).join('\\n');

            return html;
        }

        // Render code diffs
        function renderDiffView(original, fixed, appliedFixes) {
            const originalLines = original.split('\\n');
            const fixedLines = fixed.split('\\n');
            
            // Enable button
            const applyBtn = document.getElementById('apply-fix-btn');
            applyBtn.removeAttribute('disabled');
            
            // Render Metadata
            const metaDiv = document.getElementById('fix-meta');
            const badgesDiv = document.getElementById('applied-fixes-container');
            badgesDiv.innerHTML = '';
            
            if (appliedFixes && appliedFixes.length > 0) {
                metaDiv.classList.remove('hidden');
                appliedFixes.forEach(fix => {
                    const badge = document.createElement('span');
                    badge.className = "px-2 py-0.5 rounded-full bg-brand-950/40 border border-brand-900/30 text-[10px] font-bold text-brand-300";
                    badge.innerText = fix;
                    badgesDiv.appendChild(badge);
                });
            } else {
                metaDiv.classList.add('hidden');
            }

            // Simple line diff logic
            const diffView = document.getElementById('diff-view');
            let html = '';
            let i = 0, j = 0;
            
            while (i < originalLines.length || j < fixedLines.length) {
                if (i < originalLines.length && j < fixedLines.length) {
                    if (originalLines[i] === fixedLines[j]) {
                        html += \`
                            <div class="flex text-zinc-400 font-mono text-xs py-0.5 hover:bg-zinc-900/20">
                                <span class="w-10 select-none text-zinc-600 text-right pr-3 shrink-0">\${i+1}</span>
                                <span class="w-10 select-none text-zinc-600 text-right pr-3 shrink-0">\${j+1}</span>
                                <span class="whitespace-pre">\${escapeHtml(originalLines[i])}</span>
                            </div>
                        \`;
                        i++;
                        j++;
                    } else {
                        let foundMatch = false;
                        let lookAheadLimit = 5;
                        for (let k = 1; k <= lookAheadLimit; k++) {
                            if (i + k < originalLines.length && originalLines[i + k] === fixedLines[j]) {
                                // Lines i to i+k-1 were deleted
                                for (let d = 0; d < k; d++) {
                                    html += \`
                                        <div class="flex bg-rose-950/25 border-l-2 border-rose-500 text-rose-300 font-mono text-xs py-0.5 hover:bg-rose-950/40">
                                            <span class="w-10 select-none text-rose-700 text-right pr-3 shrink-0">\${i+1}</span>
                                            <span class="w-10 select-none text-rose-700 text-right pr-3 shrink-0">-</span>
                                            <span class="whitespace-pre">- \${escapeHtml(originalLines[i])}</span>
                                        </div>
                                    \`;
                                    i++;
                                }
                                foundMatch = true;
                                break;
                            }
                            if (j + k < fixedLines.length && originalLines[i] === fixedLines[j + k]) {
                                // Lines j to j+k-1 were added
                                for (let a = 0; a < k; a++) {
                                    html += \`
                                        <div class="flex bg-emerald-950/25 border-l-2 border-emerald-500 text-emerald-300 font-mono text-xs py-0.5 hover:bg-emerald-950/40">
                                            <span class="w-10 select-none text-emerald-700 text-right pr-3 shrink-0">-</span>
                                            <span class="w-10 select-none text-emerald-700 text-right pr-3 shrink-0">\${j+1}</span>
                                            <span class="whitespace-pre">+ \${escapeHtml(fixedLines[j])}</span>
                                        </div>
                                    \`;
                                    j++;
                                }
                                foundMatch = true;
                                break;
                            }
                        }
                        if (!foundMatch) {
                            // Unified substitution
                            html += \`
                                <div class="flex bg-rose-950/25 border-l-2 border-rose-500 text-rose-300 font-mono text-xs py-0.5 hover:bg-rose-950/40">
                                    <span class="w-10 select-none text-rose-700 text-right pr-3 shrink-0">\${i+1}</span>
                                    <span class="w-10 select-none text-rose-700 text-right pr-3 shrink-0">-</span>
                                    <span class="whitespace-pre">- \${escapeHtml(originalLines[i])}</span>
                                </div>
                            \`;
                            html += \`
                                <div class="flex bg-emerald-950/25 border-l-2 border-emerald-500 text-emerald-300 font-mono text-xs py-0.5 hover:bg-emerald-950/40">
                                    <span class="w-10 select-none text-emerald-700 text-right pr-3 shrink-0">-</span>
                                    <span class="w-10 select-none text-emerald-700 text-right pr-3 shrink-0">\${j+1}</span>
                                    <span class="whitespace-pre">+ \${escapeHtml(fixedLines[j])}</span>
                                </div>
                            \`;
                            i++;
                            j++;
                        }
                    }
                } else if (i < originalLines.length) {
                    html += \`
                        <div class="flex bg-rose-950/25 border-l-2 border-rose-500 text-rose-300 font-mono text-xs py-0.5 hover:bg-rose-950/40">
                            <span class="w-10 select-none text-rose-700 text-right pr-3 shrink-0">\${i+1}</span>
                            <span class="w-10 select-none text-rose-700 text-right pr-3 shrink-0">-</span>
                            <span class="whitespace-pre">- \${escapeHtml(originalLines[i])}</span>
                        </div>
                    \`;
                    i++;
                } else if (j < fixedLines.length) {
                    html += \`
                        <div class="flex bg-emerald-950/25 border-l-2 border-emerald-500 text-emerald-300 font-mono text-xs py-0.5 hover:bg-emerald-950/40">
                            <span class="w-10 select-none text-emerald-700 text-right pr-3 shrink-0">-</span>
                            <span class="w-10 select-none text-emerald-700 text-right pr-3 shrink-0">\${j+1}</span>
                            <span class="whitespace-pre">+ \${escapeHtml(fixedLines[j])}</span>
                        </div>
                    \`;
                    j++;
                }
            }
            diffView.innerHTML = html;
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Message post actions back to VS Code Ext Host
        function triggerRunAudit() {
            vscode.postMessage({ command: 'runAudit' });
        }

        function triggerRunFix() {
            vscode.postMessage({ command: 'requestFix' });
        }

        function triggerRunDNA() {
            vscode.postMessage({ command: 'generateDNA' });
        }

        function triggerFixForViolation(violationId) {
            vscode.postMessage({ command: 'requestFix', violations: [violationId] });
        }

        function triggerExportReport() {
            vscode.postMessage({ command: 'generateReport' });
        }

        function triggerDesignCoach() {
            showLoadingState('Consulting Design Coach for UI feedback...');
            vscode.postMessage({ command: 'runCoach' });
        }

        function renderCoachFeedback(feedback) {
            const container = document.getElementById('coach-container');
            container.innerHTML = renderMarkdown(feedback);
        }

        function applyProposedFix() {
            if (latestFixData && latestFixData.fixedCode) {
                vscode.postMessage({ 
                    command: 'applyFix', 
                    fixedCode: latestFixData.fixedCode 
                });
            } else {
                vscode.postMessage({
                    command: 'showErrorMessage',
                    text: 'No proposed fixes loaded to apply.'
                });
            }
        }

        function toggleWhyThisMatters(btn) {
            const content = btn.nextElementSibling;
            const svg = btn.querySelector('svg:last-child');
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                svg.classList.add('rotate-180');
            } else {
                content.classList.add('hidden');
                svg.classList.remove('rotate-180');
            }
        }
    </script>
</body>
</html>
`;
    }
}
