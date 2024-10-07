import { DataSource } from "typeorm";
import { User, Photo, Vote, Metric } from "../models";

let dataSource: DataSource;

export async function getDataSource(): Promise<DataSource> {
    if (!dataSource) {
        dataSource = new DataSource({
            type: "mariadb",
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || "3306"),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [User, Vote, Metric, Photo],
            synchronize: false,
            logging: true,
        });
    }

    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }

    return dataSource;
}