import { Test, TestingModule } from '@nestjs/testing';
import { DropshipperController } from './dropshipper.controller';
import { DropshipperService } from './dropshipper.service';

describe('DropshipperController', () => {
  let controller: DropshipperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DropshipperController],
      providers: [DropshipperService],
    }).compile();

    controller = module.get<DropshipperController>(DropshipperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
