import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SRXService } from './srx.service';
import { CrowdinApiService } from './crowdin-api.service';

@Injectable()
export class ParserConfigurationService {
  private readonly logger = new Logger(ParserConfigurationService.name);

  constructor(
    private configService: ConfigService,
    private srxService: SRXService,
    private crowdinApiService: CrowdinApiService,
  ) {}

  async configureXMLParser(projectId: string, projectGroup: string): Promise<void> {
    try {
      // Get SRX rules from immutable file
      const srxRules = await this.srxService.getSRXRules();
      
      // Validate rules
      const isValid = await this.srxService.validateSRXRules(srxRules);
      if (!isValid) {
        throw new Error('Invalid SRX rules');
      }

      // Configure parser settings according to requirements
      const configuration = {
        translateContent: true,
        translateAttributes: true,
        translatableElements: '',
        enableContentSegmentation: true,
        useCustomSegmentationRules: true,
        srxRules,
      };

      this.logger.log(`Configuring XML parser for project ${projectId} in group ${projectGroup}`);
      this.logger.log('Configuration:', configuration);
      
      // Get all XML files in the project and configure them
      const files = await this.crowdinApiService.getXMLFilesInProject(parseInt(projectId));
      
      for (const file of files) {
        try {
          await this.crowdinApiService.updateFileParserConfiguration(
            parseInt(projectId),
            file.id,
            configuration,
          );
          this.logger.log(`Successfully configured ${file.name}`);
        } catch (error) {
          this.logger.error(`Failed to configure ${file.name}:`, error);
        }
      }
      
    } catch (error) {
      this.logger.error('Error configuring XML parser:', error);
      throw error;
    }
  }

  async isConfigured(projectId: string): Promise<boolean> {
    try {
      const files = await this.crowdinApiService.getXMLFilesInProject(parseInt(projectId));
      
      if (files.length === 0) {
        return true; // No XML files to configure
      }

      // Check if all files have the required configuration
      for (const file of files) {
        const expectedConfig = {
          translateContent: true,
          translateAttributes: true,
          translatableElements: '',
          enableContentSegmentation: true,
          useCustomSegmentationRules: true,
          srxRules: await this.srxService.getSRXRules(),
        };

        const isConfigured = await this.crowdinApiService.hasRequiredParserConfiguration(
          parseInt(projectId),
          file.id,
          expectedConfig,
        );

        if (!isConfigured) {
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking configuration status for project ${projectId}:`, error);
      return false;
    }
  }

  async getConfigurationStatus(projectId: string): Promise<{
    isConfigured: boolean;
    totalFiles: number;
    configuredFiles: number;
    unconfiguredFiles: string[];
  }> {
    const result = {
      isConfigured: false,
      totalFiles: 0,
      configuredFiles: 0,
      unconfiguredFiles: [] as string[],
    };

    try {
      const files = await this.crowdinApiService.getXMLFilesInProject(parseInt(projectId));
      result.totalFiles = files.length;

      if (files.length === 0) {
        result.isConfigured = true;
        return result;
      }

      const expectedConfig = {
        translateContent: true,
        translateAttributes: true,
        translatableElements: '',
        enableContentSegmentation: true,
        useCustomSegmentationRules: true,
        srxRules: await this.srxService.getSRXRules(),
      };

      for (const file of files) {
        const isConfigured = await this.crowdinApiService.hasRequiredParserConfiguration(
          parseInt(projectId),
          file.id,
          expectedConfig,
        );

        if (isConfigured) {
          result.configuredFiles++;
        } else {
          result.unconfiguredFiles.push(file.name);
        }
      }

      result.isConfigured = result.configuredFiles === result.totalFiles;
      
    } catch (error) {
      this.logger.error(`Error getting configuration status for project ${projectId}:`, error);
    }

    return result;
  }
}
