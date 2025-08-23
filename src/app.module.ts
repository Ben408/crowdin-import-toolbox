import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './controller/app.controller';
import { SRXController } from './controller/srx.controller';
import { CrowdinCredentialsService } from './service/crowdin-credentials.service';
import { CryptoService } from './service/crypto.service';
import { SRXService } from './service/srx.service';
import { ParserConfigurationService } from './service/parser-configuration.service';
import { CrowdinContextGuard } from './guard/crowdin-context.guard';
import { CrowdinClientGuard } from './guard/crowdin-client.guard';
import { CrowdinCredentials } from './entity/crowdin-credentials';
import { SRXConfiguration } from './entity/srx-configuration';
import { ParserConfiguration } from './entity/parser-configuration';
import configuration from './config/configuration';
import { TypeOrmConfig } from './config/typeorm-config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      CrowdinCredentials,
      SRXConfiguration,
      ParserConfiguration,
    ]),
    
    // Static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'resources'),
      serveRoot: '/assets',
    }),
  ],
  controllers: [
    AppController,
    SRXController,
  ],
  providers: [
    CrowdinCredentialsService,
    CryptoService,
    SRXService,
    ParserConfigurationService,
    CrowdinContextGuard,
    CrowdinClientGuard,
  ],
})
export class AppModule {}
