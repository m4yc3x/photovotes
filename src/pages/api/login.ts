import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { User } from '../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { key } = req.body;

    if (!key) {
        return res.status(400).json({ message: 'Key is required' });
    }

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    try {
        const user = await userRepository.findOne({ where: { key } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid key' });
        }

        // You might want to generate a session token here instead of sending the whole user object
        res.status(200).json({ id: user.id, name: user.name, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}