import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { Vote, User, Photo, Metric } from '../../models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = await getDataSource();
    const voteRepository = dataSource.getRepository(Vote);
    const userRepository = dataSource.getRepository(User);
    const photoRepository = dataSource.getRepository(Photo);
    const metricRepository = dataSource.getRepository(Metric);

    switch (req.method) {
        case 'GET':
            try {
                const allVotes = await voteRepository.find();
                const populatedVotes = await Promise.all(allVotes.map(async (vote) => ({
                    ...vote,
                    user: await vote.user,
                    photo: await vote.photo,
                    metric: await vote.metric
                })));
                res.status(200).json(populatedVotes);
            } catch (error) {
                console.error('Error fetching votes:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
            break;

        case 'POST':
            const { photoId, votes } = req.body;
            const userId = req.headers['user-id'];

            if (!userId || !photoId || !votes || !Array.isArray(votes)) {
                return res.status(400).json({ message: 'Invalid request data' });
            }

            try {
                const user = await userRepository.findOne({ where: { id: parseInt(userId as string) } });
                const photo = await photoRepository.findOne({ where: { id: photoId } });

                if (!user || !photo) {
                    return res.status(404).json({ message: 'User or Photo not found' });
                }

                const newVotes = await Promise.all(votes.map(async (vote: { metricId: number; value: number }) => {
                    const metric = await metricRepository.findOne({ where: { id: vote.metricId } });
                    if (!metric) {
                        throw new Error(`Metric with id ${vote.metricId} not found`);
                    }
                    const newVote = voteRepository.create({
                        value: vote.value
                    });
                    newVote.user = Promise.resolve(user);
                    newVote.photo = Promise.resolve(photo);
                    newVote.metric = Promise.resolve(metric);
                    return newVote;
                }));

                await voteRepository.save(newVotes);

                res.status(201).json({ message: 'Votes submitted successfully' });
            } catch (error) {
                console.error('Error submitting votes:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
            break;

        case 'PUT':
            const updateUserId = req.headers['user-id'];
            const { photoId: updatePhotoId, votes: updateVotes } = req.body;

            if (!updateUserId || !updatePhotoId || !updateVotes || !Array.isArray(updateVotes)) {
                return res.status(400).json({ message: 'Invalid request data' });
            }

            try {
                const user = await userRepository.findOne({ where: { id: parseInt(updateUserId as string) } });
                const photo = await photoRepository.findOne({ where: { id: updatePhotoId } });

                if (!user || !photo) {
                    return res.status(404).json({ message: 'User or Photo not found' });
                }

                for (const vote of updateVotes) {
                    const metric = await metricRepository.findOne({ where: { id: vote.metricId } });
                    if (!metric) {
                        throw new Error(`Metric with id ${vote.metricId} not found`);
                    }

                    await voteRepository.update(
                        { user, photo, metric },
                        { value: vote.value }
                    );
                }

                res.status(200).json({ message: 'Votes updated successfully' });
            } catch (error) {
                console.error('Error updating votes:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}