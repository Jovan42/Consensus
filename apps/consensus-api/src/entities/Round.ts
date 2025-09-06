import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RoundStatus } from '../types/enums';
import { Club } from './Club';
import { Member } from './Member';
import { Recommendation } from './Recommendation';

@Entity('rounds')
export class Round {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  clubId: string;

  @Column('uuid')
  currentRecommenderId: string;

  @Column({
    type: 'enum',
    enum: RoundStatus,
    default: RoundStatus.RECOMMENDING
  })
  status: RoundStatus;

  @Column({ nullable: true })
  winningRecommendationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Club, club => club.rounds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'currentRecommenderId' })
  currentRecommender: Member;

  @OneToMany(() => Recommendation, recommendation => recommendation.round)
  recommendations: Recommendation[];
}
