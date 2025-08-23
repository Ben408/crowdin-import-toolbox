import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrowdinCredentials } from '../entity/crowdin-credentials';
import { CryptoService } from './crypto.service';

@Injectable()
export class CrowdinCredentialsService {
  constructor(
    @InjectRepository(CrowdinCredentials)
    private crowdinCredentialsRepository: Repository<CrowdinCredentials>,
    private cryptoService: CryptoService,
  ) {}

  async installApp(event: any): Promise<void> {
    // Handle app installation
    console.log('Installing app:', event);
  }

  async uninstallApp(event: any): Promise<void> {
    // Handle app uninstallation
    console.log('Uninstalling app:', event);
  }

  async exists(crowdinId: string): Promise<boolean> {
    const credentials = await this.crowdinCredentialsRepository.findOne({
      where: { crowdinId },
    });
    return !!credentials;
  }
}
