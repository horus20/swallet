import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { RoleType } from '../../../constants';
import type { UserEntity } from '../user.entity';

// TODO, remove this class and use constructor's second argument's type
export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @ApiProperty()
  phone: string;

  @ApiPropertyOptional({ enum: RoleType })
  role: RoleType;

  @ApiPropertyOptional()
  isActive?: boolean;

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user);
    this.role = user.role;
    this.phone = user.phone;
    this.isActive = options?.isActive;
  }
}
