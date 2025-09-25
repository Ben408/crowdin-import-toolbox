import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrowdinApiService } from './crowdin-api.service';
import { SRXService } from './srx.service';

export interface MonitoringResult {
  processedFiles: number;
  configuredFiles: number;
  errors: string[];
  timestamp: Date;
}

@Injectable()
export class FileMonitoringService {
  private readonly logger = new Logger(FileMonitoringService.name);
  private isMonitoringEnabled: boolean = true;
  private lastCheckTime: Date = new Date();

  constructor(
    private configService: ConfigService,
    private crowdinApiService: CrowdinApiService,
    private srxService: SRXService,
  ) {}

  /**
   * Enable or disable monitoring
   */
  setMonitoringEnabled(enabled: boolean): void {
    this.isMonitoringEnabled = enabled;
    this.logger.log(`File monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get monitoring status
   */
  isEnabled(): boolean {
    return this.isMonitoringEnabled;
  }

  /**
   * Cron job to check for new XML files every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkForNewFiles(): Promise<MonitoringResult> {
    if (!this.isMonitoringEnabled) {
      return {
        processedFiles: 0,
        configuredFiles: 0,
        errors: ['Monitoring is disabled'],
        timestamp: new Date(),
      };
    }

    const result: MonitoringResult = {
      processedFiles: 0,
      configuredFiles: 0,
      errors: [],
      timestamp: new Date(),
    };

    try {
      this.logger.log('Starting file monitoring check...');
      
      const projectGroupId = this.configService.get('srx.projectGroupId');
      const newFiles = await this.crowdinApiService.checkForNewXMLFiles(projectGroupId);
      
      result.processedFiles = newFiles.length;
      
      if (newFiles.length === 0) {
        this.logger.log('No new XML files found requiring configuration');
        return result;
      }

      this.logger.log(`Found ${newFiles.length} XML files requiring configuration`);

      // Process each file
      for (const file of newFiles) {
        try {
          await this.configureFile(file.projectId, file.fileId, file.fileName);
          result.configuredFiles++;
          this.logger.log(`Successfully configured ${file.fileName} in project ${file.projectId}`);
        } catch (error) {
          const errorMsg = `Failed to configure ${file.fileName} in project ${file.projectId}: ${error.message}`;
          result.errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      this.lastCheckTime = new Date();
      
    } catch (error) {
      const errorMsg = `File monitoring check failed: ${error.message}`;
      result.errors.push(errorMsg);
      this.logger.error(errorMsg);
    }

    this.logger.log(`File monitoring completed: ${result.configuredFiles}/${result.processedFiles} files configured`);
    return result;
  }

  /**
   * Manually trigger file monitoring check
   */
  async triggerManualCheck(): Promise<MonitoringResult> {
    this.logger.log('Manual file monitoring check triggered');
    return await this.checkForNewFiles();
  }

  /**
   * Configure a specific XML file with SRX rules
   */
  async configureFile(projectId: number, fileId: number, fileName: string): Promise<void> {
    try {
      // Get SRX rules
      const srxRules = await this.srxService.getSRXRules();
      
      // Validate SRX rules
      const isValid = await this.srxService.validateSRXRules(srxRules);
      if (!isValid) {
        throw new Error('SRX rules validation failed');
      }

      // Create parser configuration
      const configuration = {
        translateContent: true,
        translateAttributes: true,
        translatableElements: '',
        enableContentSegmentation: true,
        useCustomSegmentationRules: true,
        srxRules,
      };

      // Apply configuration to file
      await this.crowdinApiService.updateFileParserConfiguration(
        projectId,
        fileId,
        configuration,
      );

      this.logger.log(`Successfully applied SRX configuration to ${fileName}`);
      
    } catch (error) {
      this.logger.error(`Error configuring file ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Configure all XML files in a specific project
   */
  async configureAllFilesInProject(projectId: number): Promise<{
    totalFiles: number;
    configuredFiles: number;
    errors: string[];
  }> {
    const result = {
      totalFiles: 0,
      configuredFiles: 0,
      errors: [] as string[],
    };

    try {
      const files = await this.crowdinApiService.getXMLFilesInProject(projectId);
      result.totalFiles = files.length;

      for (const file of files) {
        try {
          await this.configureFile(projectId, file.id, file.name);
          result.configuredFiles++;
        } catch (error) {
          result.errors.push(`Failed to configure ${file.name}: ${error.message}`);
        }
      }

    } catch (error) {
      result.errors.push(`Failed to process project ${projectId}: ${error.message}`);
    }

    return result;
  }

  /**
   * Configure all XML files in all projects in the target group
   */
  async configureAllFilesInGroup(): Promise<{
    totalProjects: number;
    totalFiles: number;
    configuredFiles: number;
    errors: string[];
  }> {
    const result = {
      totalProjects: 0,
      totalFiles: 0,
      configuredFiles: 0,
      errors: [] as string[],
    };

    try {
      const projectGroupId = this.configService.get('srx.projectGroupId');
      const projects = await this.crowdinApiService.getProjectsInGroup(projectGroupId);
      result.totalProjects = projects.length;

      for (const project of projects) {
        try {
          const projectResult = await this.configureAllFilesInProject(project.id);
          result.totalFiles += projectResult.totalFiles;
          result.configuredFiles += projectResult.configuredFiles;
          result.errors.push(...projectResult.errors);
        } catch (error) {
          result.errors.push(`Failed to process project ${project.name} (${project.id}): ${error.message}`);
        }
      }

    } catch (error) {
      result.errors.push(`Failed to process project group: ${error.message}`);
    }

    return result;
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): {
    isEnabled: boolean;
    lastCheckTime: Date;
    autoConfigurationEnabled: boolean;
    targetProjectGroup: string;
    srxRulesFile: string;
  } {
    return {
      isEnabled: this.isMonitoringEnabled,
      lastCheckTime: this.lastCheckTime,
      autoConfigurationEnabled: this.configService.get('srx.enableAutoConfiguration'),
      targetProjectGroup: this.configService.get('srx.projectGroup'),
      srxRulesFile: this.configService.get('srx.rulesFile'),
    };
  }
}
