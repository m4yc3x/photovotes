import { DataSource } from "typeorm";
import { Photo } from "../models/Photo";

let AppDataSource: DataSource;

export const getDataSource = async () => {
    if (AppDataSource && AppDataSource.isInitialized) {
        return AppDataSource;
    }

    AppDataSource = new DataSource({
        type: "mysql",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "3306"),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: true,
        logging: false,
        entities: [Photo],
        migrations: [],
        subscribers: [],
    });

    await AppDataSource.initialize();
    return AppDataSource;
};