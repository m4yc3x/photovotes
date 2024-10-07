import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Metric } from "./Metric";
import { Photo } from "./Photo";

@Entity("votes")
export class Vote {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("float")
    value!: number;

    @ManyToOne(() => User, (user: User) => user.votes, { lazy: true })
    user!: Promise<User>;

    @ManyToOne(() => Metric, (metric: Metric) => metric.votes, { lazy: true })
    metric!: Promise<Metric>;

    @ManyToOne(() => Photo, (photo: Photo) => photo.votes, { lazy: true })
    photo!: Promise<Photo>;
}