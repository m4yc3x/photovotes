import { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '../../lib/database';
import { Photo } from '../../models/Photo';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dataSource = await getDataSource();
    const photoRepository = dataSource.getRepository(Photo);

    console.log('Received request:', req.method, req.url);

    switch (req.method) {
        case 'GET':
            try {
                const photos = await photoRepository.find({ order: { id: 'DESC' } });
                res.status(200).json(photos);
            } catch (error) {
                console.error('Error fetching photos:', error);
                res.status(500).json({ message: 'Error fetching photos' });
            }
            break;

        case 'POST':
            if (req.query.action === 'migrate') {
                console.log('Starting photo migration process');
                try {
                    const photos = await photoRepository.find();
                    console.log(`Found ${photos.length} photos to process`);

                    const publicDir = path.join(process.cwd(), 'public');
                    const uploadsDir = path.join(publicDir, 'uploads');
                    await fs.mkdir(uploadsDir, { recursive: true });

                    let migratedCount = 0;

                    for (const photo of photos) {
                        if (!photo.imageUrl.startsWith('/uploads/')) {
                            try {
                                console.log(`Processing photo ${photo.id}: ${photo.imageUrl}`);
                                const response = await fetch(photo.imageUrl);
                                if (!response.ok) {
                                    console.error(`Failed to fetch image for photo ${photo.id}: ${response.statusText}`);
                                    continue;
                                }

                                const arrayBuffer = await response.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);

                                const fileExtension = path.extname(new URL(photo.imageUrl).pathname) || '.jpg';
                                const fileName = `${uuidv4()}${fileExtension}`;
                                const filePath = path.join(uploadsDir, fileName);

                                await fs.writeFile(filePath, buffer);
                                console.log(`Saved image for photo ${photo.id}: ${fileName}`);

                                photo.imageUrl = `/uploads/${fileName}`;
                                await photoRepository.save(photo);
                                console.log(`Updated photo ${photo.id} with new imageUrl`);
                                migratedCount++;
                            } catch (error) {
                                console.error(`Error migrating photo ${photo.id}:`, error);
                            }
                        } else {
                            console.log(`Skipping already migrated photo ${photo.id}`);
                        }
                    }

                    console.log(`Migration completed. Migrated ${migratedCount} photos`);
                    res.status(200).json({ message: `Successfully migrated ${migratedCount} photos` });
                } catch (error) {
                    console.error('Error during migration:', error);
                    res.status(500).json({ message: 'Error migrating photos', error: (error as Error).message });
                }
            } else {
                try {
                    const { username, imageUrl } = req.body;

                    // Fetch the image from the provided URL
                    const response = await fetch(imageUrl);
                    if (!response.ok) {
                        throw new Error('Failed to fetch image');
                    }

                    // Generate a unique filename
                    const fileExtension = path.extname(new URL(imageUrl).pathname);
                    const fileName = `${uuidv4()}${fileExtension}`;

                    // Define the path where the image will be saved
                    const publicDir = path.join(process.cwd(), 'public');
                    const uploadsDir = path.join(publicDir, 'uploads');
                    const filePath = path.join(uploadsDir, fileName);

                    // Ensure the uploads directory exists
                    await fs.mkdir(uploadsDir, { recursive: true });

                    // Save the image to the filesystem
                    const arrayBuffer = await response.arrayBuffer();
                    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

                    // Create the new photo entry with the local file path
                    const newPhoto = photoRepository.create({
                        username,
                        imageUrl: `/uploads/${fileName}` // This is the path that will be used in <img src>
                    });

                    const savedPhoto = await photoRepository.save(newPhoto);
                    res.status(201).json(savedPhoto);
                } catch (error) {
                    console.error('Error creating photo:', error);
                    res.status(500).json({ message: 'Error creating photo' });
                }
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ message: 'Photo ID is required' });
                }

                // Fetch the photo to get the file path
                const photo = await photoRepository.findOne({ where: { id: Number(id) } });
                if (!photo) {
                    return res.status(404).json({ message: 'Photo not found' });
                }

                // Delete the file from the filesystem
                const filePath = path.join(process.cwd(), 'public', photo.imageUrl);
                await fs.unlink(filePath);

                // Delete the photo from the database
                const result = await photoRepository.delete(id);
                if (result.affected === 0) {
                    return res.status(404).json({ message: 'Photo not found' });
                }
                res.status(200).json({ message: 'Photo deleted successfully' });
            } catch (error) {
                console.error('Error deleting photo:', error);
                res.status(500).json({ message: 'Error deleting photo' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}