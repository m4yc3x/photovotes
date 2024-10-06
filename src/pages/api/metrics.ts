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

        case 'POST':
            const newMetric = metricRepository.create(req.body);
            await metricRepository.save(newMetric);
            res.status(201).json(newMetric);
            break;

        case 'PUT':
            const { id } = req.query;
            await metricRepository.update(id, req.body);
            const updatedMetric = await metricRepository.findOne({ where: { id: Number(id) } });
            res.status(200).json(updatedMetric);
            break;

        case 'DELETE':
            const { id: deleteId } = req.query;
            await metricRepository.delete(deleteId);
            res.status(204).end();
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}