import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { Photo } from '../../models/Photo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = await getDataSource();
    const photoRepository = dataSource.getRepository(Photo);

    switch (req.method) {
        case 'GET':
            try {
                const photos = await photoRepository.find();
                res.status(200).json(photos);
            } catch (error) {
                console.error('Error fetching photos:', error);
                res.status(500).json({ message: 'Error fetching photos' });
            }
            break;

        case 'POST':
            try {
                const newPhoto = photoRepository.create(req.body);
                const savedPhoto = await photoRepository.save(newPhoto);
                res.status(201).json(savedPhoto);
            } catch (error) {
                console.error('Error creating photo:', error);
                res.status(500).json({ message: 'Error creating photo' });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ message: 'Photo ID is required' });
                }
                const result = await photoRepository.delete(id);
                if (result.affected === 0) {
                    return res.status(404).json({ message: 'Photo not found' });
                }
                res.status(200).json({ message: 'Photo deleted successfully' });
            } catch (error) {
                console.error('Error deleting photo:', error);
                res.status(500).json({ message: 'Error deleting photo' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}