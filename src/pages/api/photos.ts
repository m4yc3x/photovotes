import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { Photo } from '../../models/Photo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = await getDataSource();
    const photoRepository = dataSource.getRepository(Photo);

    switch (req.method) {
        case 'GET':
            const photos = await photoRepository.find();
            res.status(200).json(photos);
            break;

        // ... other cases ...

        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}