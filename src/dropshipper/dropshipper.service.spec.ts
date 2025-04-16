import { Test, TestingModule } from '@nestjs/testing';
import { DropshipperService } from './dropshipper.service';

describe('DropshipperService', () => {
  let service: DropshipperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DropshipperService],
    }).compile();

    service = module.get<DropshipperService>(DropshipperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
