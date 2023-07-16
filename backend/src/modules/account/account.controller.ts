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
import { ApiPageOkResponse, Auth, AuthUser } from "../../decorators";
import { RoleType } from "../../constants";
import { UserEntity } from "../user/user.entity";
import { AccountDto } from "./dto/account.dto";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UseLanguageInterceptor } from "../../interceptors/language-interceptor.service";
import { PageDto } from "../../common/dto/page.dto";
import { AccountPageOptionsDto } from "./dto/account-page-options.dto";

@Controller('accounts')
@ApiTags('accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

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
}
