import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

import type { IAbstractEntity } from '../../common/abstract.entity';
import { AbstractEntity } from '../../common/abstract.entity';
import { RoleType } from '../../constants';
import { UseDto, VirtualColumn } from '../../decorators';
import { PostEntity } from '../post/post.entity';
import type { UserDtoOptions } from './dtos/user.dto';
import { UserDto } from './dtos/user.dto';
import type { IUserSettingsEntity } from './user-settings.entity';
import { UserSettingsEntity } from './user-settings.entity';
import { AccountEntity } from "../account/account.entity";

export interface IUserEntity extends IAbstractEntity<UserDto> {
  role: RoleType;

  password?: string;

  phone?: string;

  settings?: IUserSettingsEntity;
}

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity
  extends AbstractEntity<UserDto, UserDtoOptions>
  implements IUserEntity
{
  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role: RoleType;

  @Column({ nullable: true })
  password?: string;

  @Column({ unique: true, nullable: false })
  phone: string;

  @OneToOne(() => UserSettingsEntity, (userSettings) => userSettings.user)
  settings?: UserSettingsEntity;

  @OneToMany(() => PostEntity, (postEntity) => postEntity.user)
  posts: PostEntity[];

  @OneToMany(() => AccountEntity, (accountEntity) => accountEntity.user)
  accounts: AccountEntity[];
}
