import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from "./account.service";
import { AccountEntity } from "./account.entity";
import { AccountController } from "./account.controller";
import { KeyEntity } from "./key.entity";
import { KeyService } from "./key.service";
import { OpEntity } from "./op.entity";
import { OpService } from "./op.service";


@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, KeyEntity, OpEntity])],
  providers: [AccountService, KeyService, OpService, ],
  controllers: [AccountController],
})
export class AccountModule {}
