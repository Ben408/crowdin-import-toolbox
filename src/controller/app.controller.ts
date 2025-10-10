import { Controller, Get, Post, Body, HttpCode, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CrowdinContextGuard } from '../guard/crowdin-context.guard';
import { CrowdinContext } from '../decorator/crowdin-context.decorator';
import { CrowdinContextInfo } from '../model/crowdin/crowdin-context-info';
import { InstallEvent, UninstallEvent } from '@crowdin/crowdin-apps-functions';
import manifest from '../config/manifest';

@Controller()
export class AppController {
  @Post('installed')
  @HttpCode(204)
  installed(@Body() event: InstallEvent): Promise<void> {
    // Handle app installation
    console.log('App installed:', event);
    return Promise.resolve();
  }

  @Post('uninstall')
  @HttpCode(204)
  uninstall(@Body() event: UninstallEvent): Promise<void> {
    // Handle app uninstallation
    console.log('App uninstalled:', event);
    return Promise.resolve();
  }

  @Get('manifest.json')
  manifest(): any {
    return manifest;
  }

  @Get()
  @UseGuards(CrowdinContextGuard)
  async main(
    @CrowdinContext() context: CrowdinContextInfo,
    @Res() res: Response,
  ) {
    // Main app interface
    const options = {
      name: manifest.name,
      description: 'Automate SRX configuration for XML files in Strava Project Group',
    };
    
    return res.render('main', options);
  }

  @Get('health')
  health(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test')
  test(): { message: string; timestamp: string } {
    return {
      message: 'Crowdin SRX Automation App is working!',
      timestamp: new Date().toISOString(),
    };
  }
}
