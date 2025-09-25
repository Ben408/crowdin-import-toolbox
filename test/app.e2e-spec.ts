import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
      });
  });

  it('/manifest.json (GET)', () => {
    return request(app.getHttpServer())
      .get('/manifest.json')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('identifier');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('baseUrl');
      });
  });

  it('/test/srx-validation (GET)', () => {
    return request(app.getHttpServer())
      .get('/test/srx-validation')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('srxRules');
        expect(res.body).toHaveProperty('isValid');
        expect(res.body).toHaveProperty('validationDetails');
      });
  });

  it('/test/monitoring-status (GET)', () => {
    return request(app.getHttpServer())
      .get('/test/monitoring-status')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('configuration');
        expect(res.body).toHaveProperty('testFiles');
        expect(res.body).toHaveProperty('readyForProduction');
      });
  });

  it('/srx/rules (GET)', () => {
    return request(app.getHttpServer())
      .get('/srx/rules')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('rules');
        expect(res.body).toHaveProperty('isValid');
      });
  });

  it('/monitoring/status (GET)', () => {
    return request(app.getHttpServer())
      .get('/monitoring/status')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('stats');
        expect(res.body).toHaveProperty('isEnabled');
        expect(res.body).toHaveProperty('lastCheckTime');
      });
  });
});
