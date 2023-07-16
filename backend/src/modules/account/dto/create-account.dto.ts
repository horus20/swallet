import { StringField } from "../../../decorators";

export class CreateAccountDto {
  @StringField()
  alias: string;

  @StringField()
  secret: string;

  @StringField()
  key: string;
}
