import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SRXService {
  private readonly srxRulesFile: string;

  constructor(private configService: ConfigService) {
    this.srxRulesFile = this.configService.get('srx.rulesFile');
  }

  async getSRXRules(): Promise<string> {
    try {
      const filePath = path.join(process.cwd(), this.srxRulesFile);
      const rules = await fs.promises.readFile(filePath, 'utf8');
      return rules;
    } catch (error) {
      console.error('Error reading SRX rules file:', error);
      throw new Error('Failed to read SRX rules file');
    }
  }

  async validateSRXRules(rules: string): Promise<boolean> {
    // Basic validation - check if it's valid XML and contains required elements
    try {
      const hasHeader = rules.includes('<srx');
      const hasBody = rules.includes('<body>');
      const hasRules = rules.includes('<rule');
      
      return hasHeader && hasBody && hasRules;
    } catch (error) {
      return false;
    }
  }
}
