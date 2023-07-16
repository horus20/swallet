import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

import { Trim } from '../../../decorators/transform.decorators';

export class UserRegisterDto {
  @ApiProperty()
  @IsString()
  @IsPhoneNumber()
  @IsNotEmpty()
  @Trim()
  readonly phone: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  readonly password: string;
}
