import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbType = this.configService.get('database.type');
    const database = this.configService.get('database.database');
    const synchronize = this.configService.get('database.synchronize');
    const logging = this.configService.get('database.logging');

    if (dbType === 'sqlite') {
      return {
        type: 'sqlite',
        database: join(process.cwd(), database),
        entities: [join(__dirname, '..', 'entity', '*.entity{.ts,.js}')],
        migrations: [join(__dirname, '..', 'migration', '*.ts')],
        synchronize,
        logging,
      };
    }

    // Default to SQLite for now
    return {
      type: 'sqlite',
      database: join(process.cwd(), database),
      entities: [join(__dirname, '..', 'entity', '*.entity{.ts,.js}')],
      migrations: [join(__dirname, '..', 'migration', '*.ts')],
      synchronize,
      logging,
    };
  }
}
