import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { Vote } from '../../models/Vote';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = await getDataSource();
    const voteRepository = dataSource.getRepository(Vote);

    switch (req.method) {
        case 'GET':
            try {
                const allVotes = await voteRepository.find({
                    relations: ['user', 'photo', 'metric']
                });
                res.status(200).json(allVotes);
            } catch (error) {
                console.error('Error fetching votes:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
            break;

        // ... other cases ...

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}