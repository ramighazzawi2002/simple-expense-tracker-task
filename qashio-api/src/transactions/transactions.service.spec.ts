import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CategoriesService } from '../categories/categories.service';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionStatus, TransactionType } from './transaction.entity';

const mockTransaction = (): Transaction => ({
  id: 'uuid-1',
  amount: 100,
  type: TransactionType.EXPENSE,
  category: { id: 'cat-1', name: 'Food', deletedAt: null },
  categoryId: 'cat-1',
  date: '2026-03-01',
  reference: 'REF-001',
  counterparty: 'Vendor',
  status: TransactionStatus.COMPLETED,
  narration: 'Test',
  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-01'),
  deletedAt: null,
});

const mockCategory = () => ({ id: 'cat-1', name: 'Food', deletedAt: null });

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    getRawOne: jest.fn(),
  };

  const mockCategoriesService = {
    findOne: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(Transaction), useValue: mockRepo },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('returns transaction when found', async () => {
      const tx = mockTransaction();
      mockRepo.findOne.mockResolvedValue(tx);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(tx);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        relations: ['category'],
      });
    });

    it('throws NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates transaction and emits event', async () => {
      const tx = mockTransaction();
      const category = mockCategory();

      mockCategoriesService.findOne.mockResolvedValue(category);
      mockRepo.create.mockReturnValue(tx);
      mockRepo.save.mockResolvedValue(tx);
      mockRepo.findOne.mockResolvedValue(tx);

      const dto = {
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'cat-1',
        date: '2026-03-01',
        status: TransactionStatus.COMPLETED,
      };

      const result = await service.create(dto);

      expect(result).toEqual(tx);
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('cat-1');
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('transaction.created', tx);
    });
  });

  describe('update', () => {
    it('updates transaction and emits event', async () => {
      const tx = mockTransaction();
      mockRepo.findOne.mockResolvedValue(tx);
      mockRepo.save.mockResolvedValue(tx);

      const dto = { amount: 200 };
      const result = await service.update('uuid-1', dto);

      expect(result).toEqual(tx);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('transaction.updated', tx);
    });

    it('throws NotFoundException when transaction not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update('missing-id', { amount: 100 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('soft-deletes transaction and emits event', async () => {
      const tx = mockTransaction();
      mockRepo.findOne.mockResolvedValue(tx);
      mockRepo.softRemove.mockResolvedValue(tx);

      await service.remove('uuid-1');

      expect(mockRepo.softRemove).toHaveBeenCalledWith(tx);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('transaction.deleted', expect.objectContaining({ id: 'uuid-1' }));
    });

    it('throws NotFoundException when transaction not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
