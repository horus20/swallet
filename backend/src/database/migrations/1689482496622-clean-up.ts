import { MigrationInterface, QueryRunner } from "typeorm";

export class cleanUp1689482496622 implements MigrationInterface {
    name = 'cleanUp1689482496622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "is_email_verified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_a000cca60bcf04454e727699490"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_name" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "first_name" character varying`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "is_email_verified" boolean NOT NULL DEFAULT false`);
    }

}
