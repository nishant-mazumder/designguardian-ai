import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import * as vscode from 'vscode';

export interface Violation {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    line?: number;
    targetContent?: string;
    replacementContent?: string;
    sourceDocument?: string;
    whyThisMatters?: string;
    expectedUXImpact?: string;
    reasoningChain?: string;
}

export interface AuditResponse {
    score: number;
    violations: Violation[];
    metrics: {
        typography: number;
        spacing: number;
        color: number;
        overall: number;
    };
    dna?: string;
}

export interface FixResponse {
    fixedCode: string;
    appliedFixes: string[];
}

export interface ScoreResponse {
    score: number;
    metrics: {
        typography: number;
        spacing: number;
        color: number;
        overall: number;
    };
}

export interface DNAResponse {
    dna: string;
}

export interface DriftResponse {
    metrics: {
        typography: number;
        spacing: number;
        color: number;
        overall: number;
    };
    driftPercentage: number;
    details: string[];
}

function getApiUrl(): string {
    const config = vscode.workspace.getConfiguration('designguardian');
    return config.get<string>('apiUrl') || 'http://localhost:3000';
}

function postRequest<T>(path: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
        const apiUrl = getApiUrl();
        const fullUrl = new url.URL(path, apiUrl).toString();
        const parsedUrl = url.parse(fullUrl);
        const postData = JSON.stringify(data);

        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const options: http.RequestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.path || path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = protocol.request(options, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body) as T);
                    } catch (e) {
                        resolve(body as unknown as T);
                    }
                } else {
                    reject(new Error(`Server returned status code ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Failed to connect to DesignGuardian server at ${apiUrl}. Is it running?\nDetails: ${e.message}`));
        });

        req.write(postData);
        req.end();
    });
}

export async function auditComponent(code: string, fileName: string): Promise<AuditResponse> {
    return postRequest<AuditResponse>('/api/audit', { code, fileName });
}

export async function fixComponent(code: string, fileName: string, violations?: string[]): Promise<FixResponse> {
    return postRequest<FixResponse>('/api/fix', { code, fileName, violations });
}

export async function fetchScore(code: string, fileName: string): Promise<ScoreResponse> {
    return postRequest<ScoreResponse>('/api/score', { code, fileName });
}

export async function fetchDNA(code: string, fileName: string): Promise<DNAResponse> {
    return postRequest<DNAResponse>('/api/dna', { code, fileName });
}

export async function fetchDrift(code: string, fileName: string): Promise<DriftResponse> {
    return postRequest<DriftResponse>('/api/drift', { code, fileName });
}

export interface CoachResponse {
    feedback: string;
}

export async function fetchCoach(code: string, fileName: string): Promise<CoachResponse> {
    return postRequest<CoachResponse>('/api/coach', { code, fileName });
}
