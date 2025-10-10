import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';

async function bootstrap() {
  // Ensure data directory exists for SQLite database
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created data directory for SQLite database');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configure Handlebars view engine
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  
  // Enable CORS for Crowdin integration
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Crowdin SRX Automation App is running on port ${port}`);
  console.log(`📊 App: ${process.env.APP_NAME || 'Crowdin SRX Automation App'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
