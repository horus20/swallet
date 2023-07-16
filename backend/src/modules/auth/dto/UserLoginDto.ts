import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from "class-validator";

export class UserLoginDto {
  @IsString()
  @IsPhoneNumber()
  @ApiProperty()
  readonly phone: string;

  @IsString()
  @ApiProperty()
  readonly password: string;
}
