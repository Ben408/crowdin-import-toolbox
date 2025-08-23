import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CrowdinContextGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Mock context for now - will be implemented with actual Crowdin integration
    request.crowdinContext = {
      crowdinId: 'mock-crowdin-id',
      clientId: 'mock-client-id',
      projectId: 'mock-project-id',
      projectGroup: 'Strava',
    };
    
    return true;
  }
}
