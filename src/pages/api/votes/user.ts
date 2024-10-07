import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../../lib/database';
import { Photo } from '../../../models/Photo';
import { Vote } from '../../../models/Vote';
import { In } from 'typeorm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const dataSource = await getDataSource();
    const photoRepository = dataSource.getRepository(Photo);
    const voteRepository = dataSource.getRepository(Vote);

    const userId = parseInt(req.headers['user-id'] as string);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const [photos, total] = await photoRepository.createQueryBuilder('photo')
            .innerJoin('photo.votes', 'vote')
            .where('vote.userId = :userId', { userId })
            .orderBy('photo.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const photoIds = photos.map(p => p.id);

        const votes = await voteRepository.find({
            where: { 
                user: { id: userId },
                photo: { id: In(photoIds) }
            },
            relations: ['metric', 'photo']
        });

        const formattedVotes = votes.reduce((acc, vote) => {
            if (vote.photo && vote.metric) {
                acc[`${vote.photo.id}-${vote.metric.id}`] = vote.value;
            }
            return acc;
        }, {} as { [key: string]: number });

        res.status(200).json({
            photos,
            votes: formattedVotes,
            total,
            page,
            limit
        });
    } catch (error) {
        console.error('Error fetching user votes:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
    }
}