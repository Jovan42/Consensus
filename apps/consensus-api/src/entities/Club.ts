import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ClubType } from '../types/enums';
import type { ClubConfig } from '../types/enums';
import { Member } from './Member';
import { Round } from './Round';

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column({
    type: 'enum',
    enum: ClubType,
    default: ClubType.BOOK
  })
  type: ClubType;

  @Column('jsonb')
  config: ClubConfig;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Member, member => member.club)
  members: Member[];

  @OneToMany(() => Round, round => round.club)
  rounds: Round[];
}
