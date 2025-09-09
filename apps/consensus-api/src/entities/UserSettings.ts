import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', default: 'system' })
  theme: string; // 'light', 'dark', 'system'

  @Column({ type: 'boolean', default: true })
  showOnlineStatus: boolean;

  @Column({ type: 'boolean', default: true })
  enableNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  enableNotificationSound: boolean;

  @Column({ type: 'varchar', default: 'default' })
  notificationSound: string; // 'default', 'chime', 'bell', 'none'

  @Column({ type: 'integer', default: 5000 })
  notificationDuration: number; // in milliseconds

  @Column({ type: 'boolean', default: true })
  emailNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  pushNotifications: boolean;

  @Column({ type: 'varchar', default: 'en' })
  language: string;

  @Column({ type: 'integer', default: 12 })
  itemsPerPage: number;

  @Column({ type: 'boolean', default: true })
  showProfilePicture: boolean;

  @Column({ type: 'boolean', default: true })
  showEmailInProfile: boolean;

  @Column({ type: 'boolean', default: false })
  autoJoinClubs: boolean;

  @Column({ type: 'boolean', default: true })
  showVoteProgress: boolean;

  @Column({ type: 'boolean', default: true })
  showCompletionProgress: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, user => user.settings)
  @JoinColumn({ name: 'userId' })
  user: User;
}
