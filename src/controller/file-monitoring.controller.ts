import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FileMonitoringService, MonitoringResult } from '../service/file-monitoring.service';
import { CrowdinApiService } from '../service/crowdin-api.service';
import { ParserConfigurationService } from '../service/parser-configuration.service';
import { CrowdinContextGuard } from '../guard/crowdin-context.guard';
import { CrowdinContext } from '../decorator/crowdin-context.decorator';
import { CrowdinContextInfo } from '../model/crowdin/crowdin-context-info';

@Controller('monitoring')
@UseGuards(CrowdinContextGuard)
export class FileMonitoringController {
  constructor(
    private fileMonitoringService: FileMonitoringService,
    private crowdinApiService: CrowdinApiService,
    private parserConfigurationService: ParserConfigurationService,
  ) {}

  /**
   * Get monitoring status and statistics
   */
  @Get('status')
  async getMonitoringStatus(): Promise<{
    stats: any;
    isEnabled: boolean;
    lastCheckTime: Date;
  }> {
    const stats = this.fileMonitoringService.getMonitoringStats();
    return {
      stats,
      isEnabled: this.fileMonitoringService.isEnabled(),
      lastCheckTime: stats.lastCheckTime,
    };
  }

  /**
   * Enable or disable monitoring
   */
  @Post('toggle')
  async toggleMonitoring(@Body() body: { enabled: boolean }): Promise<{
    success: boolean;
    message: string;
    enabled: boolean;
  }> {
    this.fileMonitoringService.setMonitoringEnabled(body.enabled);
    return {
      success: true,
      message: `Monitoring ${body.enabled ? 'enabled' : 'disabled'} successfully`,
      enabled: body.enabled,
    };
  }

  /**
   * Manually trigger file monitoring check
   */
  @Post('check')
  async triggerManualCheck(): Promise<MonitoringResult> {
    return await this.fileMonitoringService.triggerManualCheck();
  }

  /**
   * Get all projects in the target group
   */
  @Get('projects')
  async getProjectsInGroup(): Promise<{
    projects: any[];
    totalProjects: number;
    targetGroup: string;
  }> {
    try {
      const targetGroupId = '24'; // Strava group ID
      const projects = await this.crowdinApiService.getProjectsInGroup(targetGroupId);
      
      return {
        projects: projects.map(project => ({
          id: project.id,
          name: project.name,
          sourceLanguageId: project.sourceLanguageId,
          targetLanguageIds: project.targetLanguageIds,
        })),
        totalProjects: projects.length,
        targetGroup: 'Strava',
      };
    } catch (error) {
      return {
        projects: [],
        totalProjects: 0,
        targetGroup: 'Strava',
      };
    }
  }

  /**
   * Get XML files in a specific project
   */
  @Get('projects/:projectId/files')
  async getXMLFilesInProject(
    @Param('projectId') projectId: string,
  ): Promise<{
    files: any[];
    totalFiles: number;
    projectId: string;
  }> {
    try {
      const files = await this.crowdinApiService.getXMLFilesInProject(parseInt(projectId));
      
      return {
        files: files.map(file => ({
          id: file.id,
          name: file.name,
          path: file.path,
          status: file.status,
          type: file.type,
          parserId: file.parserId,
        })),
        totalFiles: files.length,
        projectId,
      };
    } catch (error) {
      return {
        files: [],
        totalFiles: 0,
        projectId,
      };
    }
  }

  /**
   * Get configuration status for a specific project
   */
  @Get('projects/:projectId/status')
  async getProjectConfigurationStatus(
    @Param('projectId') projectId: string,
  ): Promise<{
    projectId: string;
    isConfigured: boolean;
    totalFiles: number;
    configuredFiles: number;
    unconfiguredFiles: string[];
  }> {
    const status = await this.parserConfigurationService.getConfigurationStatus(projectId);
    return {
      projectId,
      ...status,
    };
  }

  /**
   * Configure all XML files in a specific project
   */
  @Post('projects/:projectId/configure')
  async configureProject(
    @Param('projectId') projectId: string,
    @CrowdinContext() context: CrowdinContextInfo,
  ): Promise<{
    success: boolean;
    message: string;
    totalFiles: number;
    configuredFiles: number;
    errors: string[];
  }> {
    try {
      // Check if project is in Strava group (basic validation)
      if (context.projectGroup !== 'Strava') {
        return {
          success: false,
          message: 'Project must be in Strava group for SRX automation',
          totalFiles: 0,
          configuredFiles: 0,
          errors: ['Project group validation failed'],
        };
      }

      const result = await this.fileMonitoringService.configureAllFilesInProject(parseInt(projectId));
      
      return {
        success: result.errors.length === 0,
        message: `Configured ${result.configuredFiles}/${result.totalFiles} files successfully`,
        totalFiles: result.totalFiles,
        configuredFiles: result.configuredFiles,
        errors: result.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to configure project: ${error.message}`,
        totalFiles: 0,
        configuredFiles: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Configure all XML files in all projects in the target group
   */
  @Post('configure-all')
  async configureAllProjects(): Promise<{
    success: boolean;
    message: string;
    totalProjects: number;
    totalFiles: number;
    configuredFiles: number;
    errors: string[];
  }> {
    try {
      const result = await this.fileMonitoringService.configureAllFilesInGroup();
      
      return {
        success: result.errors.length === 0,
        message: `Configured ${result.configuredFiles}/${result.totalFiles} files across ${result.totalProjects} projects`,
        totalProjects: result.totalProjects,
        totalFiles: result.totalFiles,
        configuredFiles: result.configuredFiles,
        errors: result.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to configure all projects: ${error.message}`,
        totalProjects: 0,
        totalFiles: 0,
        configuredFiles: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Get monitoring history (placeholder for future implementation)
   */
  @Get('history')
  async getMonitoringHistory(
    @Query('limit') limit: string = '10',
  ): Promise<{
    history: any[];
    totalEntries: number;
  }> {
    // TODO: Implement monitoring history storage and retrieval
    return {
      history: [],
      totalEntries: 0,
    };
  }
}
