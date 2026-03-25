import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

const mockCategory = (): Category => ({
  id: 'cat-1',
  name: 'Food',
  deletedAt: null,
});

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all categories ordered by name', async () => {
      const cats = [mockCategory()];
      mockRepo.find.mockResolvedValue(cats);

      const result = await service.findAll();

      expect(result).toEqual(cats);
      expect(mockRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

  describe('findOne', () => {
    it('returns category when found', async () => {
      const cat = mockCategory();
      mockRepo.findOneBy.mockResolvedValue(cat);

      const result = await service.findOne('cat-1');

      expect(result).toEqual(cat);
    });

    it('throws NotFoundException when not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves category', async () => {
      const cat = mockCategory();
      mockRepo.create.mockReturnValue(cat);
      mockRepo.save.mockResolvedValue(cat);

      const result = await service.create({ name: 'Food' });

      expect(result).toEqual(cat);
      expect(mockRepo.create).toHaveBeenCalledWith({ name: 'Food' });
      expect(mockRepo.save).toHaveBeenCalledWith(cat);
    });
  });

  describe('remove', () => {
    it('soft-deletes category', async () => {
      const cat = mockCategory();
      mockRepo.findOneBy.mockResolvedValue(cat);
      mockRepo.softRemove.mockResolvedValue(cat);

      await service.remove('cat-1');

      expect(mockRepo.softRemove).toHaveBeenCalledWith(cat);
    });

    it('throws NotFoundException when category not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
