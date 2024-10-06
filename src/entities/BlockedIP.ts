import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BlockedIP {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ip: string;

    @Column()
    expiresAt: Date;
}