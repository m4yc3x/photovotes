import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1728285991456 implements MigrationInterface {
    name = 'InitialMigration1728285991456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`metric\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`scale\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`photo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`imageUrl\` varchar(255) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`votes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`value\` float NOT NULL, \`userId\` int NULL, \`metricId\` int NULL, \`photoId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`key\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_93f18065a2dd9f6b26c138b37c\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`votes\` ADD CONSTRAINT \`FK_5169384e31d0989699a318f3ca4\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`votes\` ADD CONSTRAINT \`FK_4a2a79a2f53e78bee5341d0dea8\` FOREIGN KEY (\`metricId\`) REFERENCES \`metric\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`votes\` ADD CONSTRAINT \`FK_d191dace60beef8f77aeec242c8\` FOREIGN KEY (\`photoId\`) REFERENCES \`photo\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`votes\` DROP FOREIGN KEY \`FK_d191dace60beef8f77aeec242c8\``);
        await queryRunner.query(`ALTER TABLE \`votes\` DROP FOREIGN KEY \`FK_4a2a79a2f53e78bee5341d0dea8\``);
        await queryRunner.query(`ALTER TABLE \`votes\` DROP FOREIGN KEY \`FK_5169384e31d0989699a318f3ca4\``);
        await queryRunner.query(`DROP INDEX \`IDX_93f18065a2dd9f6b26c138b37c\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`votes\``);
        await queryRunner.query(`DROP TABLE \`photo\``);
        await queryRunner.query(`DROP TABLE \`metric\``);
    }

}
