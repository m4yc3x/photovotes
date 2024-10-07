import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { User } from '../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    switch (req.method) {
        case 'GET':
            const users = await userRepository.find();
            res.status(200).json(users);
            break;

        case 'POST':
            const newUser = userRepository.create(req.body);
            await userRepository.save(newUser);
            res.status(201).json(newUser);
            break;

        case 'PUT':
            const { id } = req.query;
            await userRepository.update(id, req.body);
            const updatedUser = await userRepository.findOne({ where: { id: Number(id) } });
            res.status(200).json(updatedUser);
            break;

        case 'DELETE':
            const { id: deleteId } = req.query;
            await userRepository.delete(deleteId);
            res.status(204).end();
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}