import { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'default_admin_password';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { password } = req.body;

        if (password === ADMIN_PASSWORD) {
            res.status(200).json({ message: 'Admin login successful' });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}