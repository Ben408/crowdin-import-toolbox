import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CrowdinCredentialsService } from './crowdin-credentials.service';

export interface CrowdinProject {
  id: number;
  name: string;
  groupId?: number;
  sourceLanguageId: string;
  targetLanguageIds: string[];
}

export interface CrowdinFile {
  id: number;
  projectId: number;
  name: string;
  path: string;
  status: string;
  type: string;
  parserId: number;
  parserOptions?: any;
}

export interface ParserConfiguration {
  translateContent: boolean;
  translateAttributes: boolean;
  translatableElements: string;
  enableContentSegmentation: boolean;
  useCustomSegmentationRules: boolean;
  srxRules?: string;
}

@Injectable()
export class CrowdinApiService {
  private readonly logger = new Logger(CrowdinApiService.name);
  private readonly baseUrl: string;
  private readonly enterpriseApiUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private crowdinCredentialsService: CrowdinCredentialsService,
  ) {
    this.baseUrl = this.configService.get('crowdin.apiUrl');
    this.enterpriseApiUrl = this.configService.get('crowdin.enterpriseApiUrl');
  }

  /**
   * Get all projects in a specific project group
   */
  async getProjectsInGroup(groupId: string): Promise<CrowdinProject[]> {
    try {
      const url = `${this.enterpriseApiUrl}/groups/${groupId}/projects`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: await this.getAuthHeaders(),
        }),
      );

      return response.data.data.map((project: any) => ({
        id: project.data.id,
        name: project.data.name,
        groupId: project.data.groupId,
        sourceLanguageId: project.data.sourceLanguageId,
        targetLanguageIds: project.data.targetLanguageIds,
      }));
    } catch (error) {
      this.logger.error(`Error fetching projects for group ${groupId}:`, error);
      throw new Error(`Failed to fetch projects for group ${groupId}`);
    }
  }

  /**
   * Get all XML files in a project
   */
  async getXMLFilesInProject(projectId: number): Promise<CrowdinFile[]> {
    try {
      const url = `${this.baseUrl}/projects/${projectId}/files`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: await this.getAuthHeaders(),
        }),
      );

      return response.data.data
        .filter((file: any) => file.data.name.toLowerCase().endsWith('.xml'))
        .map((file: any) => ({
          id: file.data.id,
          projectId: file.data.projectId,
          name: file.data.name,
          path: file.data.path,
          status: file.data.status,
          type: file.data.type,
          parserId: file.data.parserId,
          parserOptions: file.data.parserOptions,
        }));
    } catch (error) {
      this.logger.error(`Error fetching XML files for project ${projectId}:`, error);
      throw new Error(`Failed to fetch XML files for project ${projectId}`);
    }
  }

  /**
   * Update file parser configuration using PATCH API
   */
  async updateFileParserConfiguration(
    projectId: number,
    fileId: number,
    configuration: ParserConfiguration,
  ): Promise<void> {
    try {
      const url = `${this.baseUrl}/projects/${projectId}/files/${fileId}`;
      
      const patchData = {
        parserId: 3, // XML parser ID
        parserOptions: {
          translateContent: configuration.translateContent,
          translateAttributes: configuration.translateAttributes,
          translatableElements: configuration.translatableElements,
          enableContentSegmentation: configuration.enableContentSegmentation,
          useCustomSegmentationRules: configuration.useCustomSegmentationRules,
          srxRules: configuration.srxRules,
        },
      };

      await firstValueFrom(
        this.httpService.patch(url, patchData, {
          headers: await this.getAuthHeaders(),
        }),
      );

      this.logger.log(`Successfully updated parser configuration for file ${fileId} in project ${projectId}`);
    } catch (error) {
      this.logger.error(`Error updating parser configuration for file ${fileId}:`, error);
      throw new Error(`Failed to update parser configuration for file ${fileId}`);
    }
  }

  /**
   * Check if file already has the required parser configuration
   */
  async hasRequiredParserConfiguration(
    projectId: number,
    fileId: number,
    expectedConfiguration: ParserConfiguration,
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/projects/${projectId}/files/${fileId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: await this.getAuthHeaders(),
        }),
      );

      const file = response.data.data;
      const parserOptions = file.parserOptions || {};

      return (
        parserOptions.translateContent === expectedConfiguration.translateContent &&
        parserOptions.translateAttributes === expectedConfiguration.translateAttributes &&
        parserOptions.enableContentSegmentation === expectedConfiguration.enableContentSegmentation &&
        parserOptions.useCustomSegmentationRules === expectedConfiguration.useCustomSegmentationRules &&
        parserOptions.srxRules === expectedConfiguration.srxRules
      );
    } catch (error) {
      this.logger.error(`Error checking parser configuration for file ${fileId}:`, error);
      return false;
    }
  }

  /**
   * Monitor for new file uploads in projects (webhook simulation)
   */
  async checkForNewXMLFiles(groupId: string, allowedProjectIds?: string): Promise<{ projectId: number; fileId: number; fileName: string }[]> {
    try {
      let projects = await this.getProjectsInGroup(groupId);
      
      // Filter projects if specific project IDs are allowed
      if (allowedProjectIds && allowedProjectIds.trim()) {
        const allowedIds = allowedProjectIds.split(',').map(id => parseInt(id.trim()));
        projects = projects.filter(project => allowedIds.includes(project.id));
        this.logger.log(`Filtered to ${projects.length} allowed projects: ${allowedIds.join(', ')}`);
      }
      const newFiles: { projectId: number; fileId: number; fileName: string }[] = [];

      for (const project of projects) {
        const files = await this.getXMLFilesInProject(project.id);
        
        for (const file of files) {
          // Check if file needs configuration (new or not configured)
          const needsConfiguration = !await this.hasRequiredParserConfiguration(
            project.id,
            file.id,
            await this.getExpectedConfiguration(),
          );

          if (needsConfiguration) {
            newFiles.push({
              projectId: project.id,
              fileId: file.id,
              fileName: file.name,
            });
          }
        }
      }

      return newFiles;
    } catch (error) {
      this.logger.error(`Error checking for new XML files in group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get the expected parser configuration based on SRX rules
   */
  private async getExpectedConfiguration(): Promise<ParserConfiguration> {
    const srxRules = await this.getSRXRules();
    
    return {
      translateContent: true,
      translateAttributes: true,
      translatableElements: '',
      enableContentSegmentation: true,
      useCustomSegmentationRules: true,
      srxRules,
    };
  }

  /**
   * Get SRX rules from configuration
   */
  private async getSRXRules(): Promise<string> {
    const rulesFile = this.configService.get('srx.rulesFile');
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const filePath = path.join(process.cwd(), rulesFile);
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      this.logger.error(`Error reading SRX rules file ${rulesFile}:`, error);
      throw new Error(`Failed to read SRX rules file: ${rulesFile}`);
    }
  }

  /**
   * Get authentication headers for API requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    // TODO: Implement proper OAuth token management
    // For now, return placeholder headers
    return {
      'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
      'Content-Type': 'application/json',
    };
  }
}
