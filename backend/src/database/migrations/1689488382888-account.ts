import { MigrationInterface, QueryRunner } from "typeorm";

export class account1689488382888 implements MigrationInterface {
    name = 'account1689488382888'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."accounts_status_enum" AS ENUM('NEW', 'WAITING_SENDING', 'WAITING_BLOCKCHAIN', 'DONE', 'ERROR')`);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "alias" character varying NOT NULL, "secret" character varying NOT NULL, "hash" character varying, "status" "public"."accounts_status_enum" NOT NULL DEFAULT 'NEW', "is_removed" boolean NOT NULL DEFAULT false, "user_id" uuid NOT NULL, CONSTRAINT "UQ_a5f4f991f324bd85b79afb8d371" UNIQUE ("alias"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_3000dad1da61b29953f07476324" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_3000dad1da61b29953f07476324"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_status_enum"`);
    }

}
