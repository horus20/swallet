import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyEntity } from './key.entity';
import { BlockchainStatusType } from '../../constants/blockchain-status-type';
import { OpEntity } from "./op.entity";
import { AccountEntity } from "./account.entity";
import { CreateOpDto } from "./dto/create-op.dto";

@Injectable()
export class OpService {
  constructor(
    @InjectRepository(OpEntity)
    private opRepository: Repository<OpEntity>,
  ) {}

  async createOp(account: AccountEntity, createOpDto: CreateOpDto): Promise<OpEntity> {
    const op = this.opRepository.create({
      op: createOpDto.op,
      accountId: account.id,
    });
    await this.opRepository.save(op);

    return op;
  }

  async getOp(id: Uuid): Promise<OpEntity> {
    const queryBuilder = this.opRepository
      .createQueryBuilder('op')
      .where('op.id = :id', { id });

    const op = await queryBuilder.getOne();

    if (!op) {
      throw new NotFoundException();
    }

    return op;
  }

  async cancelOp(id: Uuid): Promise<OpEntity> {
    const op = await this.getOp(id);

    this.opRepository.merge(op, {
      status: BlockchainStatusType.CANCELED,
    });

    await this.opRepository.save(op);

    return this.getOp(id);
  }

  async confirmOp(id: Uuid): Promise<OpEntity> {
    const op = await this.getOp(id);

    this.opRepository.merge(op, {
      status: BlockchainStatusType.READY_FOR_GENERATE,
    });

    await this.opRepository.save(op);

    return this.getOp(id);
  }

  async getByStatus(status: BlockchainStatusType): Promise<OpEntity[]> {
    const queryBuilder = this.opRepository
      .createQueryBuilder('op')
      .where('op.status = :status', { status });

    return queryBuilder.getMany();
  }

  async update(account: OpEntity,  updateParams: Object): Promise<OpEntity> {
    this.opRepository.merge(account, updateParams);
    return this.opRepository.save(account);
  }

  async updateStatus(account: OpEntity,  status: BlockchainStatusType): Promise<OpEntity> {
    return this.update(account, {
      status,
    })
  }
}
