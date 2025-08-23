import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SRXService } from '../service/srx.service';
import { ParserConfigurationService } from '../service/parser-configuration.service';
import { CrowdinContextGuard } from '../guard/crowdin-context.guard';
import { CrowdinContext } from '../decorator/crowdin-context.decorator';
import { CrowdinContextInfo } from '../model/crowdin/crowdin-context-info';

@Controller('srx')
@UseGuards(CrowdinContextGuard)
export class SRXController {
  constructor(
    private srxService: SRXService,
    private parserConfigurationService: ParserConfigurationService,
  ) {}

  @Get('rules')
  async getSRXRules(): Promise<{ rules: string; isValid: boolean }> {
    try {
      const rules = await this.srxService.getSRXRules();
      const isValid = await this.srxService.validateSRXRules(rules);
      
      return { rules, isValid };
    } catch (error) {
      throw new Error('Failed to retrieve SRX rules');
    }
  }

  @Post('configure/:projectId')
  async configureProject(
    @Param('projectId') projectId: string,
    @CrowdinContext() context: CrowdinContextInfo,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if project is in Strava group
      if (context.projectGroup !== 'Strava') {
        return {
          success: false,
          message: 'Project must be in Strava group for SRX automation',
        };
      }

      // Check if already configured
      const isConfigured = await this.parserConfigurationService.isConfigured(projectId);
      if (isConfigured) {
        return {
          success: true,
          message: 'Project already has SRX configuration',
        };
      }

      // Configure the parser
      await this.parserConfigurationService.configureXMLParser(projectId, context.projectGroup);
      
      return {
        success: true,
        message: 'XML parser configured successfully with SRX rules',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to configure parser: ${error.message}`,
      };
    }
  }

  @Get('status/:projectId')
  async getProjectStatus(
    @Param('projectId') projectId: string,
  ): Promise<{ configured: boolean; lastUpdated?: string }> {
    try {
      const isConfigured = await this.parserConfigurationService.isConfigured(projectId);
      return {
        configured: isConfigured,
        lastUpdated: isConfigured ? new Date().toISOString() : undefined,
      };
    } catch (error) {
      return { configured: false };
    }
  }
}
