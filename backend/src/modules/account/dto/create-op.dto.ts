import { StringField, StringFieldOptional } from "../../../decorators";

export class CreateOpDto {
  @StringField()
  op: string;
}
