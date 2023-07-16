import { MigrationInterface, QueryRunner } from "typeorm";

export class op1689512029457 implements MigrationInterface {
    name = 'op1689512029457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ops_status_enum" AS ENUM('NEW', 'READY_FOR_GENERATE', 'WAITING_BLOCKCHAIN', 'DONE', 'READY_TO_REMOVE', 'REMOVED', 'ERROR', 'FAILED', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "ops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "op" character varying NOT NULL, "hash" character varying, "status" "public"."ops_status_enum" NOT NULL DEFAULT 'NEW', "validation_result" character varying NOT NULL DEFAULT false, "account_id" uuid NOT NULL, CONSTRAINT "PK_286052b484764842578a7287507" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."keys_status_enum" RENAME TO "keys_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."keys_status_enum" AS ENUM('NEW', 'READY_FOR_GENERATE', 'WAITING_BLOCKCHAIN', 'DONE', 'READY_TO_REMOVE', 'REMOVED', 'ERROR', 'FAILED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "status" TYPE "public"."keys_status_enum" USING "status"::"text"::"public"."keys_status_enum"`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "status" SET DEFAULT 'NEW'`);
        await queryRunner.query(`DROP TYPE "public"."keys_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."accounts_status_enum" RENAME TO "accounts_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."accounts_status_enum" AS ENUM('NEW', 'READY_FOR_GENERATE', 'WAITING_BLOCKCHAIN', 'DONE', 'READY_TO_REMOVE', 'REMOVED', 'ERROR', 'FAILED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "status" TYPE "public"."accounts_status_enum" USING "status"::"text"::"public"."accounts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "status" SET DEFAULT 'NEW'`);
        await queryRunner.query(`DROP TYPE "public"."accounts_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "ops" ADD CONSTRAINT "FK_75e414b2142f097fe5dbde7ed5b" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ops" DROP CONSTRAINT "FK_75e414b2142f097fe5dbde7ed5b"`);
        await queryRunner.query(`CREATE TYPE "public"."accounts_status_enum_old" AS ENUM('NEW', 'WAITING_SENDING', 'WAITING_BLOCKCHAIN', 'DONE', 'ERROR')`);
        await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "status" TYPE "public"."accounts_status_enum_old" USING "status"::"text"::"public"."accounts_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "status" SET DEFAULT 'NEW'`);
        await queryRunner.query(`DROP TYPE "public"."accounts_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."accounts_status_enum_old" RENAME TO "accounts_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."keys_status_enum_old" AS ENUM('NEW', 'WAITING_SENDING', 'WAITING_BLOCKCHAIN', 'DONE', 'ERROR')`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "status" TYPE "public"."keys_status_enum_old" USING "status"::"text"::"public"."keys_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "status" SET DEFAULT 'NEW'`);
        await queryRunner.query(`DROP TYPE "public"."keys_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."keys_status_enum_old" RENAME TO "keys_status_enum"`);
        await queryRunner.query(`DROP TABLE "ops"`);
        await queryRunner.query(`DROP TYPE "public"."ops_status_enum"`);
    }

}
