import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SRXService } from '../service/srx.service';
import { ParserConfigurationService } from '../service/parser-configuration.service';
import { CrowdinContextGuard } from '../guard/crowdin-context.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('test')
@UseGuards(CrowdinContextGuard)
export class TestController {
  constructor(
    private srxService: SRXService,
    private parserConfigurationService: ParserConfigurationService,
  ) {}

  /**
   * Test SRX rules validation with sample XML files
   */
  @Get('srx-validation')
  async testSRXValidation(): Promise<{
    srxRules: string;
    isValid: boolean;
    validationDetails: any;
  }> {
    try {
      const srxRules = await this.srxService.getSRXRules();
      const isValid = await this.srxService.validateSRXRules(srxRules);

      return {
        srxRules,
        isValid,
        validationDetails: {
          hasHeader: srxRules.includes('<srx'),
          hasBody: srxRules.includes('<body>'),
          hasRules: srxRules.includes('<rule'),
          ruleCount: (srxRules.match(/<rule/g) || []).length,
          languageRuleCount: (srxRules.match(/<languagerule/g) || []).length,
        },
      };
    } catch (error) {
      throw new Error(`SRX validation test failed: ${error.message}`);
    }
  }

  /**
   * Test XML parsing with sample files
   */
  @Get('xml-samples')
  async testXMLSamples(): Promise<{
    samples: Array<{
      fileName: string;
      content: string;
      hasParagraphs: boolean;
      hasHeadings: boolean;
      hasListItems: boolean;
      segmentCount: number;
    }>;
  }> {
    try {
      const testFilesDir = path.join(process.cwd(), 'Test Files');
      const files = fs.readdirSync(testFilesDir).filter(file => file.endsWith('.xml'));
      
      const samples = files.map(fileName => {
        const filePath = path.join(testFilesDir, fileName);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Analyze XML structure for SRX rule application
        const hasParagraphs = content.includes('<p>') || content.includes('</p>');
        const hasHeadings = /<h[1-6]/.test(content);
        const hasListItems = content.includes('<li>') || content.includes('</li>');
        
        // Count potential segments based on SRX rules
        const paragraphSegments = (content.match(/<\/p>/g) || []).length;
        const headingSegments = (content.match(/<\/h[1-6]>/g) || []).length;
        const listSegments = (content.match(/<\/li>/g) || []).length;
        const segmentCount = paragraphSegments + headingSegments + listSegments;
        
        return {
          fileName,
          content: content.substring(0, 200) + '...', // Truncate for display
          hasParagraphs,
          hasHeadings,
          hasListItems,
          segmentCount,
        };
      });

      return { samples };
    } catch (error) {
      throw new Error(`XML samples test failed: ${error.message}`);
    }
  }

  /**
   * Test parser configuration template
   */
  @Get('parser-config')
  async testParserConfig(): Promise<{
    template: any;
    srxRules: string;
    expectedSegmentation: any;
  }> {
    try {
      const srxRules = await this.srxService.getSRXRules();
      
      const template = {
        translateContent: true,
        translateAttributes: true,
        translatableElements: '',
        enableContentSegmentation: true,
        useCustomSegmentationRules: true,
        srxRules,
      };

      const expectedSegmentation = {
        breakRules: [
          {
            pattern: '</p>',
            description: 'Break after paragraph tags',
            example: '<p>Content here</p>[\s\S]',
          },
          {
            pattern: '</h.*?>',
            description: 'Break after heading tags (h1-h6)',
            example: '<h1>Title</h1>[\s\S]',
          },
          {
            pattern: '</li>',
            description: 'Break after list item tags',
            example: '<li>Item content</li>[\s\S]',
          },
        ],
        totalRules: 3,
        languageMapping: 'All languages use default rules',
      };

      return {
        template,
        srxRules,
        expectedSegmentation,
      };
    } catch (error) {
      throw new Error(`Parser config test failed: ${error.message}`);
    }
  }

  /**
   * Simulate file configuration process
   */
  @Post('simulate-configuration')
  async simulateConfiguration(@Body() body: { projectId: string; fileName: string }): Promise<{
    success: boolean;
    message: string;
    configuration: any;
    segmentationPreview: any;
  }> {
    try {
      const { projectId, fileName } = body;
      
      // Get SRX rules and create configuration
      const srxRules = await this.srxService.getSRXRules();
      const configuration = {
        translateContent: true,
        translateAttributes: true,
        translatableElements: '',
        enableContentSegmentation: true,
        useCustomSegmentationRules: true,
        srxRules,
      };

      // Read the test file to show segmentation preview
      const testFilesDir = path.join(process.cwd(), 'Test Files');
      const filePath = path.join(testFilesDir, fileName);
      
      let segmentationPreview = null;
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Simulate segmentation based on SRX rules
        const segments = [];
        const paragraphMatches = content.match(/<p>.*?<\/p>/gs) || [];
        const headingMatches = content.match(/<h[1-6]>.*?<\/h[1-6]>/gs) || [];
        const listMatches = content.match(/<li>.*?<\/li>/gs) || [];
        
        paragraphMatches.forEach((match, index) => {
          segments.push({
            type: 'paragraph',
            index: index + 1,
            content: match.substring(0, 100) + '...',
            breakAfter: '</p>',
          });
        });
        
        headingMatches.forEach((match, index) => {
          segments.push({
            type: 'heading',
            index: index + 1,
            content: match.substring(0, 100) + '...',
            breakAfter: match.match(/<\/h[1-6]>/)?.[0] || '</h1>',
          });
        });
        
        listMatches.forEach((match, index) => {
          segments.push({
            type: 'list_item',
            index: index + 1,
            content: match.substring(0, 100) + '...',
            breakAfter: '</li>',
          });
        });

        segmentationPreview = {
          totalSegments: segments.length,
          segments: segments.slice(0, 5), // Show first 5 segments
          fileSize: content.length,
          hasMoreSegments: segments.length > 5,
        };
      }

      return {
        success: true,
        message: `Successfully simulated configuration for ${fileName} in project ${projectId}`,
        configuration,
        segmentationPreview,
      };
    } catch (error) {
      return {
        success: false,
        message: `Simulation failed: ${error.message}`,
        configuration: null,
        segmentationPreview: null,
      };
    }
  }

  /**
   * Test monitoring service functionality
   */
  @Get('monitoring-status')
  async testMonitoringStatus(): Promise<{
    status: string;
    configuration: any;
    testFiles: string[];
    readyForProduction: boolean;
  }> {
    try {
      const testFilesDir = path.join(process.cwd(), 'Test Files');
      const testFiles = fs.existsSync(testFilesDir) 
        ? fs.readdirSync(testFilesDir).filter(file => file.endsWith('.xml'))
        : [];

      const srxRules = await this.srxService.getSRXRules();
      const isValid = await this.srxService.validateSRXRules(srxRules);

      const configuration = {
        targetProjectGroup: 'Strava',
        targetProjectGroupId: '24',
        srxRulesFile: 'strava_help_center_srx.srx',
        autoConfigurationEnabled: true,
        monitoringInterval: '5 minutes',
      };

      const readyForProduction = isValid && testFiles.length > 0;

      return {
        status: readyForProduction ? 'Ready for testing' : 'Configuration needed',
        configuration,
        testFiles,
        readyForProduction,
      };
    } catch (error) {
      return {
        status: 'Error',
        configuration: null,
        testFiles: [],
        readyForProduction: false,
      };
    }
  }
}
