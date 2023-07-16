import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from "./account.service";
import { AccountEntity } from "./account.entity";
import { AccountController } from "./account.controller";
import { KeyEntity } from "./key.entity";


@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, KeyEntity])],
  providers: [AccountService,],
  controllers: [AccountController],
})
export class AccountModule {}
