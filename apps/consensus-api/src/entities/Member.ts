import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Club } from './Club';
import { Vote } from './Vote';
import { Completion } from './Completion';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar', { nullable: true })
  email: string; // For future OAuth integration

  @Column('uuid')
  clubId: string;

  @Column('boolean', { default: false })
  isClubManager: boolean;

  @ManyToOne(() => Club, club => club.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Vote, vote => vote.member)
  votes: Vote[];

  @OneToMany(() => Completion, completion => completion.member)
  completions: Completion[];
}
