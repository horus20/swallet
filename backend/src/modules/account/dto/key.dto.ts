import { AbstractDto } from "../../../common/dto/abstract.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BlockchainStatusType } from "../../../constants/blockchain-status-type";
import { KeyEntity } from "../key.entity";

export class KeyDto extends AbstractDto {
  @ApiProperty()
  key: string;

  @ApiPropertyOptional({ enum: BlockchainStatusType })
  status: BlockchainStatusType;

  @ApiPropertyOptional()
  hash?: string;

  constructor(keyEntity: KeyEntity) {
    super(keyEntity);

    this.key = keyEntity.key;
    this.status = keyEntity.status;
    this.hash = keyEntity.hash;
  }
}
