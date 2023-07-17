import { MigrationInterface, QueryRunner } from "typeorm";

export class addressUpdate1689578082013 implements MigrationInterface {
    name = 'addressUpdate1689578082013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ADD "address" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "address"`);
    }

}
