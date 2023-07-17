import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import { UserEntity } from '../user/user.entity';
import { AccountDto } from './dto/account.dto';
import { BlockchainStatusType } from "../../constants/blockchain-status-type";
import { KeyEntity } from "./key.entity";
import { OpEntity } from "./op.entity";

@Entity({ name: 'accounts' })
@UseDto(AccountDto)
export class AccountEntity extends AbstractEntity<AccountDto> {
  @Column({ unique: true, nullable: false })
  alias: string;

  @Column({ nullable: false })
  secret: string;

  @Column({ nullable: true })
  hash: string;

  @Column({ type: 'enum', enum: BlockchainStatusType, default: BlockchainStatusType.NEW })
  status: BlockchainStatusType;

  @Column({nullable: true})
  address: string;

  @Column({ default: false})
  isRemoved?: boolean;

  @Column({ type: 'uuid' })
  userId: Uuid;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.accounts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => KeyEntity, (keyEntity) => keyEntity.account)
  keys?: KeyEntity[];

  @OneToMany(() => OpEntity, (opEntity) => opEntity.account)
  operations?: KeyEntity[];
}
