import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import { BlockchainStatusType } from "../../constants/blockchain-status-type";
import { KeyDto } from "./dto/key.dto";
import { AccountEntity } from "./account.entity";
import { OpDto } from "./dto/op.dto";

@Entity({ name: 'ops' })
@UseDto(OpDto)
export class OpEntity extends AbstractEntity<OpDto> {
  @Column({ nullable: false })
  op: string;

  @Column({ nullable: true })
  hash: string;

  @Column({ type: 'enum', enum: BlockchainStatusType, default: BlockchainStatusType.NEW })
  status: BlockchainStatusType;

  @Column({ default: false})
  validationResult?: string;

  @Column({ type: 'uuid' })
  accountId: Uuid;

  @ManyToOne(() => AccountEntity, (accountEntity) => accountEntity.operations, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;
}
