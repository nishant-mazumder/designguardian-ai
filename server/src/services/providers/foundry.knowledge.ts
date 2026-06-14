import { Rule } from 'shared';
import { KnowledgeProvider } from './knowledge.provider';
import { LocalKnowledgeProvider } from './local.knowledge';
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';

export class FoundryKnowledgeProvider implements KnowledgeProvider {
  private endpoint: string;
  private projectId: string;
  private agentId: string;
  private apiKey: string;
  private localFallback: LocalKnowledgeProvider;
  private cache: Map<string, any> = new Map();

  constructor(
    endpoint: string,
    projectId: string,
    agentId: string,
    apiKey: string,
    localFallback: LocalKnowledgeProvider
  ) {
    this.endpoint = endpoint || '';
    this.projectId = projectId || '';
    this.agentId = agentId || '';
    this.apiKey = apiKey || '';
    this.localFallback = localFallback;
    console.log('FoundryKnowledgeProvider: Initializing with endpoint:', this.endpoint || '(Demo Mode: Local Fallback Active)');
  }

  private isConfigured(): boolean {
    return !!(this.endpoint && this.apiKey);
  }

  // Helper to make native HTTP/HTTPS requests to Microsoft Foundry IQ API
  private makeRequest<T>(path: string, body: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const fullUrl = `${this.endpoint.replace(/\/$/, '')}${path}`;
      const parsedUrl = url.parse(fullUrl);
      const postData = JSON.stringify(body);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const options: http.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Foundry-Project-Id': this.projectId,
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 5000 // 5 seconds timeout
      };

      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data) as T);
            } catch (err) {
              resolve(data as unknown as T);
            }
          } else {
            reject(new Error(`Foundry IQ returned status code ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request to Microsoft Foundry IQ timed out.'));
      });

      req.write(postData);
      req.end();
    });
  }

  async getRelevantRules(category?: string): Promise<Rule[]> {
    if (!this.isConfigured()) {
      console.log('FoundryKnowledgeProvider: Credentials unconfigured. Falling back to LocalKnowledgeProvider.');
      return this.localFallback.getRelevantRules(category);
    }

    const cacheKey = `relevant_${category || 'all'}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Call Foundry semantic retrieve API
      const path = `/projects/${this.projectId}/knowledge/retrieve`;
      const query = category ? `design rules for category ${category}` : 'all design system rules';
      
      const response = await this.makeRequest<any>(path, {
        query,
        topK: 15,
        filter: category ? { category } : undefined
      });

      // Parse the retrieved documents back into rules
      const rules = this.parseFoundryDocumentsToRules(response.documents || []);
      
      if (rules.length === 0) {
        throw new Error('No rules returned from Foundry IQ query.');
      }

      this.cache.set(cacheKey, rules);
      return rules;

    } catch (error) {
      console.error('FoundryKnowledgeProvider: Failed to retrieve rules from Foundry IQ. Falling back.', (error as any).message);
      return this.localFallback.getRelevantRules(category);
    }
  }

  async searchKnowledge(query: string): Promise<Rule[]> {
    if (!this.isConfigured()) {
      return this.localFallback.searchKnowledge(query);
    }

    try {
      const path = `/projects/${this.projectId}/knowledge/search`;
      const response = await this.makeRequest<any>(path, {
        query,
        topK: 8
      });

      const rules = this.parseFoundryDocumentsToRules(response.documents || []);
      if (rules.length === 0) {
        return this.localFallback.searchKnowledge(query);
      }
      return rules;
    } catch (error) {
      console.error('FoundryKnowledgeProvider: search failed, falling back.', (error as any).message);
      return this.localFallback.searchKnowledge(query);
    }
  }

  async retrieveRuleCitations(ruleId: string): Promise<string[]> {
    if (!this.isConfigured()) {
      return this.localFallback.retrieveRuleCitations(ruleId);
    }

    try {
      const path = `/projects/${this.projectId}/knowledge/citations`;
      const response = await this.makeRequest<any>(path, {
        ruleId,
        includeMetadata: true
      });

      if (response.citations && response.citations.length > 0) {
        return response.citations.map((c: any) => `${c.sourceDocument || 'foundry-iq'}: ${c.text}`);
      }

      return this.localFallback.retrieveRuleCitations(ruleId);
    } catch (error) {
      console.error('FoundryKnowledgeProvider: retrieve citations failed, falling back.', (error as any).message);
      return this.localFallback.retrieveRuleCitations(ruleId);
    }
  }

  async getDesignContext(query: string): Promise<string> {
    if (!this.isConfigured()) {
      return this.localFallback.getDesignContext(query);
    }

    try {
      const path = `/agents/${this.agentId}/query`;
      const response = await this.makeRequest<any>(path, {
        prompt: `Extract the Design DNA and general visual style guidelines matching this query: ${query}`,
        stream: false
      });

      return response.content || response.text || this.localFallback.getDesignContext(query);
    } catch (error) {
      console.error('FoundryKnowledgeProvider: getDesignContext failed, falling back.', (error as any).message);
      return this.localFallback.getDesignContext(query);
    }
  }

  // Convert Foundry IQ returned chunk structures to Rule interface structures
  private parseFoundryDocumentsToRules(documents: any[]): Rule[] {
    const rules: Rule[] = [];
    
    for (const doc of documents) {
      const metadata = doc.metadata || {};
      const ruleId = metadata.ruleId || metadata.id || 'FOUNDRY-RULE';
      const ruleName = metadata.ruleName || metadata.name || 'Foundry Retrieved Rule';
      const category = metadata.category || 'other';
      const severity = metadata.severity || 'warning';
      const allowedValues = metadata.allowedValues || null;
      const recommendation = metadata.recommendation || doc.content || doc.text || '';

      rules.push({
        id: ruleId,
        name: ruleName,
        category: category,
        description: doc.content || doc.text || 'Rule details from Foundry KB.',
        severity: severity,
        value: allowedValues,
        recommendation: recommendation
      });
    }

    return rules;
  }
}
