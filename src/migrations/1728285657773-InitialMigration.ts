import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1728285657773 implements MigrationInterface {
    name = 'InitialMigration1728285657773'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`FK_5169384e31d0989699a318f3ca4\` ON \`votes\``);
        await queryRunner.query(`ALTER TABLE \`votes\` DROP FOREIGN KEY \`FK_4a2a79a2f53e78bee5341d0dea8\``);
        await queryRunner.query(`ALTER TABLE \`metric\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`metric\` CHANGE \`scale\` \`scale\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`votes\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`votes\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`votes\` CHANGE \`metricId\` \`metricId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`votes\` ADD CONSTRAINT \`FK_5169384e31d0989699a318f3ca4\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`votes\` ADD CONSTRAINT \`FK_4a2a79a2f53e78bee5341d0dea8\` FOREIGN KEY (\`metricId\`) REFERENCES \`metric\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`votes\` DROP FOREIGN KEY \`FK_4a2a79a2f53e78bee5341d0dea8\``);
        await queryRunner.query(`ALTER TABLE \`votes\` DROP FOREIGN KEY \`FK_5169384e31d0989699a318f3ca4\``);
        await queryRunner.query(`ALTER TABLE \`votes\` CHANGE \`metricId\` \`metricId\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`votes\` CHANGE \`userId\` \`userId\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`votes\` CHANGE \`id\` \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`metric\` CHANGE \`scale\` \`scale\` int UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`metric\` CHANGE \`id\` \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`votes\` ADD CONSTRAINT \`FK_4a2a79a2f53e78bee5341d0dea8\` FOREIGN KEY (\`metricId\`) REFERENCES \`metric\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE INDEX \`FK_5169384e31d0989699a318f3ca4\` ON \`votes\` (\`userId\`)`);
    }

}
