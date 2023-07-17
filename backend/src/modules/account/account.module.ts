import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from "./account.service";
import { AccountEntity } from "./account.entity";
import { AccountController } from "./account.controller";
import { KeyEntity } from "./key.entity";
import { KeyService } from "./key.service";
import { OpEntity } from "./op.entity";
import { OpService } from "./op.service";
import { ScheduleModule } from "@nestjs/schedule";
import { BlockchainService } from "./blockchain.service";


@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, KeyEntity, OpEntity]), ScheduleModule.forRoot()],
  providers: [AccountService, KeyService, OpService, BlockchainService, ],
  controllers: [AccountController],
})
export class AccountModule {}
