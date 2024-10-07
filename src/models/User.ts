import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Vote } from "./Vote.js";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    key!: string;

    @Column()
    role!: string;

    @OneToMany(() => Vote, (vote: Vote) => vote.user)
    votes!: Vote[];
}

export default User;