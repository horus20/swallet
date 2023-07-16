import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyEntity } from './key.entity';
import { BlockchainStatusType } from '../../constants/blockchain-status-type';

@Injectable()
export class KeyService {
  constructor(
    @InjectRepository(KeyEntity)
    private keyRepository: Repository<KeyEntity>,
  ) {}

  async createKey(key: string, accountId: string): Promise<KeyEntity> {
    const keyEntity = this.keyRepository.create({
      key,
      accountId,
    });
    await this.keyRepository.save(keyEntity);

    return keyEntity;
  }

  async getKey(id: Uuid): Promise<KeyEntity> {
    const queryBuilder = this.keyRepository
      .createQueryBuilder('key')
      .where('key.id = :id', { id });

    const key = await queryBuilder.getOne();

    if (!key) {
      throw new NotFoundException();
    }

    return key;
  }

  async deleteKey(key: KeyEntity): Promise<void> {
    this.keyRepository.merge(key, {
      isRemoved: true,
      status: BlockchainStatusType.READY_TO_REMOVE,
    });

    await this.keyRepository.save(key);
  }
}
