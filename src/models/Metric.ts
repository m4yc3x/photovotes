import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Metric {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    scale!: number;
}