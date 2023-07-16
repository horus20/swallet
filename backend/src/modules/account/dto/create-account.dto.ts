import { StringField, StringFieldOptional } from "../../../decorators";

export class CreateAccountDto {
  @StringField()
  alias: string;

  @StringField()
  secret: string;

  @StringFieldOptional()
  key?: string;
}
