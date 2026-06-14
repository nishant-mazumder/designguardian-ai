import { Rule } from 'shared';

export interface KnowledgeProvider {
  /**
   * Get rules, optionally filtered by category.
   */
  getRelevantRules(category?: string): Promise<Rule[]>;

  /**
   * Search rules semantic text for a match.
   */
  searchKnowledge(query: string): Promise<Rule[]>;

  /**
   * Get exact citation guidelines for a rule.
   */
  retrieveRuleCitations(ruleId: string): Promise<string[]>;

  /**
   * Get design style contextual descriptions.
   */
  getDesignContext(query: string): Promise<string>;
}
