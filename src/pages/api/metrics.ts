import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { Metric } from '../../models/Metric';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = await getDataSource();
    const metricRepository = dataSource.getRepository(Metric);

    switch (req.method) {
        case 'GET':
            const metrics = await metricRepository.find();
            res.status(200).json(metrics);
            break;

        // ... other cases ...

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}