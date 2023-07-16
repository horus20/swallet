import { AbstractDto } from "../../../common/dto/abstract.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BlockchainStatusType } from "../../../constants/blockchain-status-type";
import { KeyEntity } from "../key.entity";
import { OpEntity } from "../op.entity";

export class OpDto extends AbstractDto {
  @ApiProperty()
  op: string;

  @ApiPropertyOptional({ enum: BlockchainStatusType })
  status: BlockchainStatusType;

  @ApiPropertyOptional()
  hash?: string;

  @ApiPropertyOptional()
  validationResult?: string;

  constructor(op: OpEntity) {
    super(op);

    this.op = op.op;
    this.status = op.status;
    this.hash = op.hash;
    this.validationResult = op.validationResult;
  }
}
