import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UserEntity } from '../user/user.entity';
import { AccountPageOptionsDto } from './dto/account-page-options.dto';
import { PageDto } from '../../common/dto/page.dto';
import { AccountDto } from './dto/account.dto';
import { KeyEntity } from './key.entity';
import { KeyService } from './key.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { CreateOpDto } from './dto/create-op.dto';
import { OpService } from './op.service';
import { BlockchainStatusType } from '../../constants/blockchain-status-type';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    private keyService: KeyService,
    private opService: OpService,
    private commandBus: CommandBus,
  ) {}

  async createAccount(
    userId: Uuid,
    createAccountDto: CreateAccountDto,
  ): Promise<AccountEntity> {
    // todo: check an already exists of the alias in the address book contract

    let accountEntity = this.accountRepository.create({
      userId,
      alias: createAccountDto.alias,
      secret: createAccountDto.secret,
    });
    await this.accountRepository.save(accountEntity);

    if (
      createAccountDto.key != null ||
      typeof createAccountDto.key != 'undefined'
    ) {
      await this.keyService.createKey(
        createAccountDto.key ?? '',
        accountEntity.id,
      );
    }

    return this.getAccount(accountEntity.id);
  }

  async getUserAccounts(
    userId: Uuid,
    accountPageOptionsDto: AccountPageOptionsDto,
  ): Promise<PageDto<AccountDto>> {
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.keys', 'key', 'key.isRemoved = false')
      .where('account.user_id = :userId', { userId })
      .andWhere('account.isRemoved = false');
    const [items, accountMetaDto] = await queryBuilder.paginate(
      accountPageOptionsDto,
    );

    return items.toPageDto(accountMetaDto);
  }

  async getAccount(
    id: Uuid,
    withSecret: boolean = false,
  ): Promise<AccountEntity> {
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.keys', 'key')
      .where('account.id = :id', { id });

    if (withSecret) {
      queryBuilder.addSelect('account.secret');
    }

    const account = await queryBuilder.getOne();
    if (!account) {
      throw new NotFoundException();
    }

    return account;
  }

  async getByStatus(status: BlockchainStatusType): Promise<AccountEntity[]> {
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .where('account.status = :status', { status })
      .andWhere('account.isRemoved = false');

    return queryBuilder.getMany();
  }

  async update(
    account: AccountEntity,
    updateParams: Object,
  ): Promise<AccountEntity> {
    this.accountRepository.merge(account, updateParams);
    return this.accountRepository.save(account);
  }

  async updateStatus(
    account: AccountEntity,
    status: BlockchainStatusType,
  ): Promise<AccountEntity> {
    return this.update(account, {
      status,
    });
  }

  async createKey(
    user: UserEntity,
    accountId: Uuid,
    createKeyDto: CreateKeyDto,
  ): Promise<KeyEntity> {
    const account = await this.checkAccess(user, accountId);

    if (account.secret != createKeyDto.secret) {
      throw new UnauthorizedException('Неверное секретное слово');
    }

    const newKey = await this.keyService.createKey(
      createKeyDto.key,
      account.id,
    );
    await this.keyService.updateStatus(
      newKey,
      BlockchainStatusType.READY_FOR_GENERATE,
    );

    return newKey;
  }

  async deleteKey(
    user: UserEntity,
    accountId: Uuid,
    keyId: Uuid,
  ): Promise<void> {
    const account = await this.checkAccess(user, accountId);
    const key = account.keys?.find((key) => key.id == keyId);
    if (typeof key === 'undefined') {
      throw new NotFoundException('Key not found');
    }

    return this.keyService.deleteKey(key);
  }

  async deleteKeys(user: UserEntity, accountId: Uuid): Promise<void> {
    const account = await this.checkAccess(user, accountId);

    if (typeof account.keys != 'undefined') {
      const promises = account.keys?.map((key) => {
        return this.keyService.deleteKey(key);
      });

      await Promise.all(promises);
    }
  }

  async createOp(user: UserEntity, accountId: Uuid, createOpDto: CreateOpDto) {
    const account = await this.checkAccess(user, accountId);

    return this.opService.createOp(account, createOpDto);
  }

  async confirmOp(user: UserEntity, accountId: Uuid, opId: Uuid) {
    await this.checkAccess(user, accountId);

    return this.opService.confirmOp(opId);
  }

  async cancelOp(user: UserEntity, accountId: Uuid, opId: Uuid) {
    await this.checkAccess(user, accountId);

    return this.opService.cancelOp(opId);
  }

  async checkAccess(user: UserEntity, accountId: Uuid): Promise<AccountEntity> {
    const account = await this.getAccount(accountId, true);
    if (account.userId != user.id) {
      throw new UnauthorizedException();
    }

    return account;
  }
}
