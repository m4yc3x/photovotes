import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Vote } from './index';

@Entity("metrics")
export class Metric {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    scale!: number;

    @OneToMany(() => Vote, (vote: Vote) => vote.metric)
    votes!: Vote[];
}