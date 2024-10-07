import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Vote } from "./Vote.js";

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column()
    imageUrl!: string;

    @Column({ default: true })
    active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Vote, (vote: Vote) => vote.photo)
    votes!: Vote[];
}

export default Photo;