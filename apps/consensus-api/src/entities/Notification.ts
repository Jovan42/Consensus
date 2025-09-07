import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Club } from './Club';
import { Round } from './Round';

export enum NotificationType {
  VOTE_CAST = 'vote_cast',
  VOTING_COMPLETED = 'voting_completed',
  RECOMMENDATION_ADDED = 'recommendation_added',
  ROUND_STARTED = 'round_started',
  ROUND_COMPLETED = 'round_completed',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_ROLE_CHANGED = 'member_role_changed',
  CLUB_UPDATED = 'club_updated'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD
  })
  status: NotificationStatus;

  @Column('varchar')
  title: string;

  @Column('text')
  message: string;

  @Column('jsonb', { nullable: true })
  data: any;

  @Column('varchar')
  userEmail: string;

  @Column('uuid')
  clubId: string;

  @Column('uuid', { nullable: true })
  roundId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Club, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @ManyToOne(() => Round, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roundId' })
  round: Round;
}
