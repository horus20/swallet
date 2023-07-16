import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import { BlockchainStatusType } from "../../constants/blockchain-status-type";
import { KeyDto } from "./dto/key.dto";
import { AccountEntity } from "./account.entity";

@Entity({ name: 'keys' })
@UseDto(KeyDto)
export class KeyEntity extends AbstractEntity<KeyDto> {
  @Column({ nullable: false })
  key: string;

  @Column({ nullable: true })
  hash: string;

  @Column({ type: 'enum', enum: BlockchainStatusType, default: BlockchainStatusType.NEW })
  status: BlockchainStatusType;

  @Column({ default: false})
  isRemoved?: boolean;

  @Column({ type: 'uuid' })
  accountId: Uuid;

  @ManyToOne(() => AccountEntity, (accountEntity) => accountEntity.keys, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;
}
