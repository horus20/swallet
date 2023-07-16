import { MigrationInterface, QueryRunner } from "typeorm";

export class key1689495897972 implements MigrationInterface {
    name = 'key1689495897972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."keys_status_enum" AS ENUM('NEW', 'WAITING_SENDING', 'WAITING_BLOCKCHAIN', 'DONE', 'ERROR')`);
        await queryRunner.query(`CREATE TABLE "keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "key" character varying NOT NULL, "hash" character varying, "status" "public"."keys_status_enum" NOT NULL DEFAULT 'NEW', "is_removed" boolean NOT NULL DEFAULT false, "account_id" uuid NOT NULL, CONSTRAINT "PK_e63d5d51e0192635ab79aa49644" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "keys" ADD CONSTRAINT "FK_d4cde5bae1b284c513757536ec8" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "keys" DROP CONSTRAINT "FK_d4cde5bae1b284c513757536ec8"`);
        await queryRunner.query(`DROP TABLE "keys"`);
        await queryRunner.query(`DROP TYPE "public"."keys_status_enum"`);
    }

}
