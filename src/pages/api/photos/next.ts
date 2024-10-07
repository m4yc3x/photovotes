import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../../lib/database';
import { Photo } from '../../../models/Photo';
import { Vote } from '../../../models/Vote';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const dataSource = await getDataSource();
    const photoRepository = dataSource.getRepository(Photo);

    const userId = parseInt(req.headers['user-id'] as string);

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const nextPhoto = await photoRepository
            .createQueryBuilder('photo')
            .where(qb => {
                const subQuery = qb
                    .subQuery()
                    .select('vote.photoId')
                    .from(Vote, 'vote')
                    .where('vote.userId = :userId', { userId })
                    .getQuery();
                return 'photo.id NOT IN ' + subQuery;
            })
            .andWhere('photo.active = :active', { active: true })
            .orderBy('RAND()')  // Randomize the order of photos
            .getOne();

        if (nextPhoto) {
            // Ensure the imageUrl is correctly formatted
            nextPhoto.imageUrl = nextPhoto.imageUrl.startsWith('http') 
                ? nextPhoto.imageUrl 
                : `${process.env.NEXT_PUBLIC_BASE_URL || ''}${nextPhoto.imageUrl}`;
            
            res.status(200).json(nextPhoto);
        } else {
            res.status(404).json({ message: 'No more photos to judge' });
        }
    } catch (error) {
        console.error('Error fetching next photo:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}