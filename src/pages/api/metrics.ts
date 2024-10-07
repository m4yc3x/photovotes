import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { Metric } from '../../models/Metric';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = await getDataSource();
    const metricRepository = dataSource.getRepository(Metric);

    switch (req.method) {
        case 'GET':
            try {
                const metrics = await metricRepository.find();
                res.status(200).json(metrics);
            } catch (error) {
                console.error('Error fetching metrics:', error);
                res.status(500).json({ message: 'Error fetching metrics' });
            }
            break;

        case 'POST':
            try {
                console.log('Received POST request with body:', req.body);
                const newMetric = metricRepository.create(req.body);
                const savedMetric = await metricRepository.save(newMetric);
                console.log('Saved new metric:', savedMetric);
                res.status(201).json(savedMetric);
            } catch (error) {
                console.error('Error creating metric:', error);
                res.status(500).json({ message: 'Error creating metric' });
            }
            break;

        case 'PUT':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ message: 'Metric ID is required' });
                }
                const metricToUpdate = await metricRepository.findOne({ where: { id: Number(id) } });
                if (!metricToUpdate) {
                    return res.status(404).json({ message: 'Metric not found' });
                }
                metricRepository.merge(metricToUpdate, req.body);
                const updatedMetric = await metricRepository.save(metricToUpdate);
                res.status(200).json(updatedMetric);
            } catch (error) {
                console.error('Error updating metric:', error);
                res.status(500).json({ message: 'Error updating metric' });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ message: 'Metric ID is required' });
                }
                const result = await metricRepository.delete(id);
                if (result.affected === 0) {
                    return res.status(404).json({ message: 'Metric not found' });
                }
                res.status(200).json({ message: 'Metric deleted successfully' });
            } catch (error) {
                console.error('Error deleting metric:', error);
                res.status(500).json({ message: 'Error deleting metric' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}