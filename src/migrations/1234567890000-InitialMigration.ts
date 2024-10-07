import { MigrationInterface, QueryRunner } from "typeorm"

export class InitialMigration1234567890000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                \`key\` VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(255) NOT NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE photos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                imageUrl VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT TRUE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await queryRunner.query(`
            CREATE TABLE metrics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                scale INT NOT NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE votes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                value FLOAT NOT NULL,
                userId INT,
                metricId INT,
                photoId INT,
                FOREIGN KEY (userId) REFERENCES users(id),
                FOREIGN KEY (metricId) REFERENCES metrics(id),
                FOREIGN KEY (photoId) REFERENCES photos(id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE votes`);
        await queryRunner.query(`DROP TABLE metrics`);
        await queryRunner.query(`DROP TABLE photos`);
        await queryRunner.query(`DROP TABLE users`);
    }
}