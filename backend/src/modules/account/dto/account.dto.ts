import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { AccountEntity } from '../account.entity';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BlockchainStatusType } from "../../../constants/blockchain-status-type";
import { KeyDto } from "./key.dto";

export class AccountDto extends AbstractDto {
  @ApiProperty()
  alias: string;

  @ApiProperty()
  secret: string;

  @ApiPropertyOptional({ enum: BlockchainStatusType })
  status: BlockchainStatusType;

  @ApiPropertyOptional()
  hash?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional({ type: KeyDto, isArray: true })
  keys?: KeyDto[]

  constructor(accountEntity: AccountEntity) {
    super(accountEntity);

    this.alias = accountEntity.alias;
    this.secret = accountEntity.secret;
    this.status = accountEntity.status;
    this.hash = accountEntity.hash;
    this.address = accountEntity.address;

    this.keys = accountEntity.keys?.map(key => key.toDto());
  }
}
