import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ParserConfiguration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: string;

  @Column()
  projectGroup: string;

  @Column({ default: true })
  translateContent: boolean;

  @Column({ default: true })
  translateAttributes: boolean;

  @Column({ default: '' })
  translatableElements: string;

  @Column({ default: true })
  enableContentSegmentation: boolean;

  @Column({ default: true })
  useCustomSegmentationRules: boolean;

  @Column({ type: 'text' })
  srxRules: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
