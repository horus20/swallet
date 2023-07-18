import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AccountService } from "./account.service";
import { ApiPageOkResponse, Auth, AuthUser, UUIDParam } from "../../decorators";
import { RoleType } from "../../constants";
import { UserEntity } from "../user/user.entity";
import { AccountDto } from "./dto/account.dto";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UseLanguageInterceptor } from "../../interceptors/language-interceptor.service";
import { PageDto } from "../../common/dto/page.dto";
import { AccountPageOptionsDto } from "./dto/account-page-options.dto";
import { CreateKeyDto } from "./dto/create-key.dto";
import { KeyService } from "./key.service";
import { CreateOpDto } from "./dto/create-op.dto";
import { OpDto } from "./dto/op.dto";
import { KeyDto } from "./dto/key.dto";

@Controller('api/accounts')
@ApiTags('accounts')
export class AccountController {
  constructor(
    private accountService: AccountService,
    private keyService: KeyService,
  ) {}

  // create new account with a key
  @Post()
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: AccountDto })
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
    @AuthUser() user: UserEntity,
  ) {
    const accountEntity = await this.accountService.createAccount(
      user.id,
      createAccountDto,
    );

    return accountEntity.toDto();
  }

  // get all user accounts
  @Get()
  @Auth([RoleType.USER])
  @UseLanguageInterceptor()
  @ApiPageOkResponse({ type: AccountDto })
  async getAccounts(
    @Query() accountsPageOptionsDto: AccountPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<PageDto<AccountDto>> {
    return this.accountService.getUserAccounts(user.id, accountsPageOptionsDto);
  }

  // add new key
  @Post(':accountId/keys')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: KeyDto })
  async createKey(
    @UUIDParam('accountId') accountId: Uuid,
    @Body() createKeyDto: CreateKeyDto,
    @AuthUser() user: UserEntity,
  ) {
    const key = await this.accountService.createKey(
      user,
      accountId,
      createKeyDto,
    );

    return key.toDto();
  }

  // disable the account key
  @Delete(':accountId/keys/:keyId')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteKey(
    @UUIDParam('accountId') accountId: Uuid,
    @UUIDParam('keyId') keyId: Uuid,
    @AuthUser() user: UserEntity,
  ): Promise<void> {
    await this.accountService.deleteKey(user, accountId, keyId);
  }

  // disable all keys
  @Delete(':accountId/keys')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteKeys(
    @UUIDParam('accountId') accountId: Uuid,
    @AuthUser() user: UserEntity,
  ): Promise<void> {
    await this.accountService.deleteKeys(user, accountId);
  }

  // add new operation
  @Post(':accountId/ops')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: OpDto })
  async createOperation(
    @UUIDParam('accountId') accountId: Uuid,
    @Body() createOpDto: CreateOpDto,
    @AuthUser() user: UserEntity,
  ) {
    const operation = await this.accountService.createOp(
      user,
      accountId,
      createOpDto,
    );

    return operation.toDto();
  }

  // confirm the operation
  @Post(':accountId/ops/:opId/confirm')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: OpDto })
  async confirmOperation(
    @UUIDParam('accountId') accountId: Uuid,
    @UUIDParam('opId') opId: Uuid,
    @AuthUser() user: UserEntity,
  ) {
    const operation = await this.accountService.confirmOp(
      user,
      accountId,
      opId,
    );

    return operation.toDto();
  }

  @Post(':accountId/ops/:opId/cancel')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: OpDto })
  async cancelperation(
    @UUIDParam('accountId') accountId: Uuid,
    @UUIDParam('opId') opId: Uuid,
    @AuthUser() user: UserEntity,
  ) {
    const operation = await this.accountService.cancelOp(
      user,
      accountId,
      opId,
    );

    return operation.toDto();
  }

  // todo: ** try to create new non-owned account

  // todo: ** get operation list?? (or we can load operation list from chain)
}
