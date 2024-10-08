import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../../lib/database';
import { Vote, User, Photo } from '../../../models';
import { Repository } from 'typeorm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, page = '1', limit = '12' } = req.query;

    if (!userId || Array.isArray(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    const pageNumber = parseInt(Array.isArray(page) ? page[0] : page);
    const limitNumber = parseInt(Array.isArray(limit) ? limit[0] : limit);

    try {
        const dataSource = await getDataSource();
        const userRepository: Repository<User> = dataSource.getRepository(User);
        const photoRepository: Repository<Photo> = dataSource.getRepository(Photo);
        const voteRepository: Repository<Vote> = dataSource.getRepository(Vote);

        const user = await userRepository.findOne({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [photos, total] = await photoRepository.findAndCount({
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber,
            order: { id: 'ASC' }
        });

        const votes = await voteRepository.find({
            where: { user: { id: user.id } },
            relations: ['photo', 'metric']
        });

        const formattedVotes = await Promise.all(
            votes.map(async (vote) => {
                const photo = await vote.photo;
                const metric = await vote.metric;
                if (photo && metric) {
                    return { [`${photo.id}-${metric.id}`]: vote.value };
                }
                return null;
            })
        );

        const mergedVotes = Object.assign({}, ...formattedVotes.filter(Boolean));

        res.status(200).json({
            photos,
            votes: mergedVotes,
            total,
            page: pageNumber,
            limit: limitNumber
        });
    } catch (error) {
        console.error('Error fetching user votes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
