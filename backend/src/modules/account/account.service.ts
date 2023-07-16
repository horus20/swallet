import { Injectable, NotFoundException } from "@nestjs/common";
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidatorService } from '../../shared/services/validator.service';
import { AccountEntity } from "./account.entity";
import { CreatePostDto } from "../post/dtos/create-post.dto";
import { PostEntity } from "../post/post.entity";
import { CreatePostCommand } from "../post/commands/create-post.command";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UserEntity } from "../user/user.entity";
import { AccountPageOptionsDto } from "./dto/account-page-options.dto";
import { PageDto } from "../../common/dto/page.dto";
import { AccountDto } from "./dto/account.dto";
import { KeyEntity } from "./key.entity";

@Injectable()
export class AccountService {

  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    @InjectRepository(KeyEntity)
    private keyRepository: Repository<KeyEntity>,
    private validatorService: ValidatorService,
    private commandBus: CommandBus,
  ) {}

  async createAccount(userId: Uuid, createAccountDto: CreateAccountDto): Promise<AccountEntity> {
    // todo: check an alias already exists

    let accountEntity = this.accountRepository.create({
      userId,
      alias: createAccountDto.alias,
      secret: createAccountDto.secret,
    })
    await this.accountRepository.save(accountEntity);

    const key = this.keyRepository.create({
      key: createAccountDto.key,
      accountId: accountEntity.id,
    })
    await this.keyRepository.save(key);

    return this.getAccount(accountEntity.id);
  }

  async getUserAccounts(
    userId: Uuid,
    accountPageOptionsDto: AccountPageOptionsDto
  ): Promise<PageDto<AccountDto>> {
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.keys', 'key')
      .where('account.user_id = :userId', { userId });
    const [items, accountMetaDto] = await queryBuilder.paginate(
      accountPageOptionsDto,
    );

    return items.toPageDto(accountMetaDto);
  }

  async getAccount(id: Uuid): Promise<AccountEntity> {
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.keys', 'key')
      .where('account.id = :id', { id });

    const account = await queryBuilder.getOne();

    if (!account) {
      throw new NotFoundException();
    }

    return account;
  }
}
