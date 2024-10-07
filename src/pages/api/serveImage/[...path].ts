import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path: filePath } = req.query;

    if (typeof filePath !== 'string') {
        return res.status(400).json({ error: 'Invalid file path' });
    }

    const imagePath = path.join(process.cwd(), 'public', 'uploads', filePath);

    if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: 'Image not found' });
    }

    const imageBuffer = fs.readFileSync(imagePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
}