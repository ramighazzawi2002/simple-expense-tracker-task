import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from '../categories/categories.service';
import { BudgetsService } from './budgets.service';
import { Budget, BudgetPeriod } from './budget.entity';
import { Transaction, TransactionType } from '../transactions/transaction.entity';

const mockBudget = (): Budget => ({
  id: 'budget-1',
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Food', deletedAt: null },
  amount: 1000,
  period: BudgetPeriod.MONTHLY,
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  deletedAt: null,
});

const mockCategory = () => ({ id: 'cat-1', name: 'Food', deletedAt: null });

describe('BudgetsService', () => {
  let service: BudgetsService;

  const mockBudgetRepo = {
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTransactionRepo = {
    createQueryBuilder: jest.fn(),
  };

  const mockCategoriesService = {
    findOne: jest.fn(),
  };

  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getRawAndEntities: jest.fn(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: getRepositoryToken(Budget), useValue: mockBudgetRepo },
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepo },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
    jest.clearAllMocks();
    mockBudgetRepo.createQueryBuilder.mockReturnValue(qb);
  });

  describe('create', () => {
    const dto = {
      categoryId: 'cat-1',
      amount: 1000,
      period: BudgetPeriod.MONTHLY,
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    };

    it('creates and returns a budget', async () => {
      const budget = mockBudget();
      const category = mockCategory();

      qb.getCount.mockResolvedValue(0);
      mockCategoriesService.findOne.mockResolvedValue(category);
      mockBudgetRepo.create.mockReturnValue(budget);
      mockBudgetRepo.save.mockResolvedValue(budget);

      const result = await service.create(dto);

      expect(result).toEqual(budget);
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('cat-1');
      expect(mockBudgetRepo.save).toHaveBeenCalled();
    });

    it('throws BadRequestException when startDate >= endDate', async () => {
      await expect(
        service.create({ ...dto, startDate: '2026-03-31', endDate: '2026-03-01' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when overlapping budget exists', async () => {
      qb.getCount.mockResolvedValue(1);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('updates and returns the budget', async () => {
      const budget = mockBudget();
      mockBudgetRepo.findOneBy.mockResolvedValue(budget);
      mockBudgetRepo.save.mockResolvedValue({ ...budget, amount: 1500 });

      const result = await service.update('budget-1', { amount: 1500 });

      expect(mockBudgetRepo.save).toHaveBeenCalled();
      expect(result.amount).toBe(1500);
    });

    it('throws NotFoundException when budget not found', async () => {
      mockBudgetRepo.findOneBy.mockResolvedValue(null);

      await expect(service.update('missing', { amount: 500 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('soft-deletes the budget', async () => {
      const budget = mockBudget();
      mockBudgetRepo.findOneBy.mockResolvedValue(budget);
      mockBudgetRepo.softRemove.mockResolvedValue(budget);

      await service.remove('budget-1');

      expect(mockBudgetRepo.softRemove).toHaveBeenCalledWith(budget);
    });

    it('throws NotFoundException when budget not found', async () => {
      mockBudgetRepo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
