import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'security.encryptionKey') {
                return 'test-encryption-key-32-characters';
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const originalText = 'test-secret-data';
      
      const encrypted = service.encrypt(originalText);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(originalText);
      expect(typeof encrypted).toBe('string');

      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it('should handle empty string', () => {
      const originalText = '';
      
      const encrypted = service.encrypt(originalText);
      const decrypted = service.decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });

    it('should handle special characters', () => {
      const originalText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      const encrypted = service.encrypt(originalText);
      const decrypted = service.decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });
  });

  describe('hash', () => {
    it('should generate consistent hash', () => {
      const text = 'test-hash-data';
      
      const hash1 = service.hash(text);
      const hash2 = service.hash(text);
      
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different inputs', () => {
      const text1 = 'test-hash-data-1';
      const text2 = 'test-hash-data-2';
      
      const hash1 = service.hash(text1);
      const hash2 = service.hash(text2);
      
      expect(hash1).not.toBe(hash2);
    });
  });
});
