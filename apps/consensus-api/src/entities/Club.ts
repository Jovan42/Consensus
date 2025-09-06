import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ClubType, TurnOrder, TieBreakingMethod } from '../types/enums';
import { Member } from './Member';
import { Round } from './Round';

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ClubType,
    default: ClubType.BOOK
  })
  type: ClubType;

  @Column('jsonb')
  config: {
    minRecommendations: number;
    maxRecommendations: number;
    votingPoints: number[];
    turnOrder: TurnOrder;
    tieBreakingMethod: TieBreakingMethod;
    minimumParticipation: number; // percentage (0-100)
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Member, member => member.club)
  members: Member[];

  @OneToMany(() => Round, round => round.club)
  rounds: Round[];
}
