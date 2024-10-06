import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { Photo } from '../../models/Photo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = await getDataSource();
    const photoRepository = dataSource.getRepository(Photo);

    if (req.method === 'GET') {
        const photos = await photoRepository.find();
        res.status(200).json(photos);
    } else if (req.method === 'POST') {
        const { username, imageUrl } = req.body;
        const photo = photoRepository.create({ username, imageUrl });
        await photoRepository.save(photo);
        res.status(201).json(photo);
    } else if (req.method === 'DELETE') {
        const { id } = req.query;
        await photoRepository.delete(id);
        res.status(200).json({ message: 'Photo deleted successfully' });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}