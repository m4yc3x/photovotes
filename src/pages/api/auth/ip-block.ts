import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../../lib/typeorm';
import { BlockedIP } from '../../../entities/BlockedIP';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = getDataSource();
    const blockedIPRepository = dataSource.getRepository(BlockedIP);

    if (req.method === 'GET') {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const blockedIP = await blockedIPRepository.findOne({ where: { ip: ip as string } });

        if (blockedIP && blockedIP.expiresAt > new Date()) {
            return res.status(200).json({ blocked: true });
        }

        return res.status(200).json({ blocked: false });
    }

    if (req.method === 'POST') {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const { expiresAt } = req.body;

        let blockedIP = await blockedIPRepository.findOne({ where: { ip: ip as string } });

        if (blockedIP) {
            blockedIP.expiresAt = new Date(expiresAt);
        } else {
            blockedIP = blockedIPRepository.create({
                ip: ip as string,
                expiresAt: new Date(expiresAt),
            });
        }

        await blockedIPRepository.save(blockedIP);

        return res.status(200).json({ blocked: true });
    }

    res.status(405).json({ message: 'Method not allowed' });
}