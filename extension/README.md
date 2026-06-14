# DesignGuardian AI - VS Code Extension

This package contains the VS Code extension for DesignGuardian AI.

## Features Registered

- **DesignGuardian: Audit Component** (`extension.audit`)
- **DesignGuardian: Auto Fix Component** (`extension.autoFix`)
- **DesignGuardian: Show Design Score** (`extension.showScore`)
- **DesignGuardian: Generate Design DNA** (`extension.generateDNA`)
- **DesignGuardian: Detect Design Drift** (`extension.detectDrift`)

## Project Structure

- `package.json` - Defines the extension manifest, registered commands, configuration properties, and build scripts.
- `tsconfig.json` - Standard TypeScript compiler configuration compiling `src/` to `out/`.
- `src/extension.ts` - Main entrypoint registering commands and capturing current code selection/files.
- `src/DesignGuardianPanel.ts` - Webview controller managing HTML construction, Tailwind CSS, SVG gauges, unified line diffs, and communications back to VS Code.
- `src/apiClient.ts` - Native Node.js `http`/`https` wrapper calling local/remote backend APIs.

## How to Build and Run

1. Open a terminal in the `extension/` directory.
2. Install standard dependencies:
   ```bash
   npm install
   ```
3. Compile the TypeScript source code:
   ```bash
   npm run compile
   ```
4. Press `F5` in VS Code to open a new **Extension Development Host** window to debug the extension.
5. In the host window, open any React/Vue/HTML component file, select a line range (or select nothing to audit the whole file), open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`), and run:
   * `DesignGuardian: Audit Component`
