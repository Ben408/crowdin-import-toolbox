import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SRXService } from './srx.service';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('SRXService', () => {
  let service: SRXService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SRXService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'srx.rulesFile') {
                return 'strava_help_center_srx.srx';
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SRXService>(SRXService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSRXRules', () => {
    it('should return SRX rules content', async () => {
      const mockSRXContent = '<srx xmlns="http://www.lisa.org/srx20" version="2.0">...</srx>';
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockSRXContent);

      const result = await service.getSRXRules();

      expect(result).toBe(mockSRXContent);
      expect(fs.promises.readFile).toHaveBeenCalledWith(
        expect.stringContaining('strava_help_center_srx.srx'),
        'utf8'
      );
    });

    it('should throw error when file read fails', async () => {
      (fs.promises.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      await expect(service.getSRXRules()).rejects.toThrow('Failed to read SRX rules file');
    });
  });

  describe('validateSRXRules', () => {
    it('should return true for valid SRX rules', async () => {
      const validSRX = `
        <srx xmlns="http://www.lisa.org/srx20" version="2.0">
          <header segmentsubflows="yes" cascade="no">
          </header>
          <body>
            <languagerules>
              <languagerule languagerulename="default">
                <rule break="yes">
                  <beforebreak>&lt;/p&gt;</beforebreak>
                  <afterbreak>[\\s\\S]</afterbreak>
                </rule>
              </languagerule>
            </languagerules>
            <maprules>
              <languagemap languagepattern=".*" languagerulename="default"></languagemap>
            </maprules>
          </body>
        </srx>
      `;

      const result = await service.validateSRXRules(validSRX);
      expect(result).toBe(true);
    });

    it('should return false for invalid SRX rules', async () => {
      const invalidSRX = '<invalid>content</invalid>';

      const result = await service.validateSRXRules(invalidSRX);
      expect(result).toBe(false);
    });

    it('should return false for empty SRX rules', async () => {
      const result = await service.validateSRXRules('');
      expect(result).toBe(false);
    });

    it('should return false for null SRX rules', async () => {
      const result = await service.validateSRXRules(null as any);
      expect(result).toBe(false);
    });
  });
});
