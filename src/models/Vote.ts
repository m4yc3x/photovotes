import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User, Metric, Photo } from "./index";

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