import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User.js";
import { Metric } from "./Metric.js";
import { Photo } from "./Photo.js";

@Entity("votes")
export class Vote {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("float")
    value!: number;

    @ManyToOne(() => User, (user: User) => user.votes)
    user!: User;

    @ManyToOne(() => Metric, (metric: Metric) => metric.votes)
    metric!: Metric;

    @ManyToOne(() => Photo, (photo: Photo) => photo.votes)
    photo!: Photo;
}

export default Vote;