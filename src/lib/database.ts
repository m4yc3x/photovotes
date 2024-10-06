import { DataSource } from 'typeorm';
import { Metric } from '../models/Metric';
import { Photo } from '../models/Photo';

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
    if (dataSource && dataSource.isInitialized) {
        return dataSource;
    }

    dataSource = new DataSource({
        type: 'mariadb',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Metric, Photo],
        synchronize: true,
    });

    await dataSource.initialize();
    return dataSource;
}