import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;
  private connected = false;
  private connectingPromise: Promise<void> | null = null;

  constructor(private readonly config: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'qashio-api',
      brokers: [this.config.get<string>('KAFKA_BROKER') ?? 'kafka:29092'],
      retry: { initialRetryTime: 300, retries: 5 },
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
    }
  }

  private async connect(): Promise<void> {
    if (this.connectingPromise) {
      await this.connectingPromise;
      return;
    }
    this.connectingPromise = (async () => {
      try {
        await this.producer.connect();
        this.connected = true;
        this.logger.log('Kafka producer connected');
      } catch (err) {
        this.connected = false;
        this.logger.warn(`Kafka producer failed to connect: ${(err as Error).message}`);
      } finally {
        this.connectingPromise = null;
      }
    })();
    await this.connectingPromise;
  }

  async publish<T>(topic: string, key: string, value: T): Promise<void> {
    if (!this.connected) {
      await this.connect();
      if (!this.connected) {
        this.logger.warn(`Kafka not connected — skipping publish to "${topic}"`);
        return;
      }
    }
    try {
      await this.producer.send({
        topic,
        messages: [{ key, value: JSON.stringify(value) }],
      });
    } catch (err) {
      this.connected = false;
      this.logger.error(`Failed to publish to "${topic}": ${(err as Error).message}`);
    }
  }
}
