import { StringField } from "../../../decorators";

export class CreateKeyDto {
  @StringField()
  key: string;

  @StringField()
  secret: string;
}
