import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KafkaProducerService } from './kafka-producer.service';

const mockProducer = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  send: jest.fn(),
};

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: () => mockProducer,
  })),
}));

describe('KafkaProducerService', () => {
  let service: KafkaProducerService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaProducerService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('kafka:29092') },
        },
      ],
    }).compile();

    service = module.get<KafkaProducerService>(KafkaProducerService);
  });

  describe('onModuleInit', () => {
    it('should connect the producer', async () => {
      mockProducer.connect.mockResolvedValueOnce(undefined);
      await service.onModuleInit();
      expect(mockProducer.connect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection failure gracefully', async () => {
      mockProducer.connect.mockRejectedValueOnce(new Error('Connection refused'));
      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect when connected', async () => {
      mockProducer.connect.mockResolvedValueOnce(undefined);
      await service.onModuleInit();
      await service.onModuleDestroy();
      expect(mockProducer.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should not disconnect when not connected', async () => {
      await service.onModuleDestroy();
      expect(mockProducer.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should send message when connected', async () => {
      mockProducer.connect.mockResolvedValueOnce(undefined);
      mockProducer.send.mockResolvedValueOnce(undefined);
      await service.onModuleInit();

      const value = { event: 'test', data: { id: '1' } };
      await service.publish('test-topic', 'key-1', value);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'test-topic',
        messages: [{ key: 'key-1', value: JSON.stringify(value) }],
      });
    });

    it('should attempt reconnection when not connected', async () => {
      mockProducer.connect.mockRejectedValueOnce(new Error('down'));
      await service.onModuleInit();

      mockProducer.connect.mockResolvedValueOnce(undefined);
      mockProducer.send.mockResolvedValueOnce(undefined);
      await service.publish('test-topic', 'key-1', { test: true });

      expect(mockProducer.connect).toHaveBeenCalledTimes(2);
      expect(mockProducer.send).toHaveBeenCalledTimes(1);
    });

    it('should skip publish when reconnection also fails', async () => {
      mockProducer.connect.mockRejectedValueOnce(new Error('still down'));
      await service.onModuleInit();
      mockProducer.connect.mockRejectedValueOnce(new Error('still down'));
      await service.publish('test-topic', 'key-1', { test: true });

      expect(mockProducer.send).not.toHaveBeenCalled();
    });

    it('should handle send failure and mark as disconnected', async () => {
      mockProducer.connect.mockResolvedValueOnce(undefined);
      mockProducer.send.mockRejectedValueOnce(new Error('broker unavailable'));
      await service.onModuleInit();

      await expect(service.publish('test-topic', 'key-1', {})).resolves.not.toThrow();
    });
  });
});
