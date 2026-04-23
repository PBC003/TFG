import { randomUUID } from 'crypto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GroupDocument = HydratedDocument<Group>;

@Schema({
  collection: 'groups',
  versionKey: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Group {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    default: () => randomUUID(),
  })
  groupId!: string;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 120 })
  name!: string;

  @Prop({ type: String, trim: true, default: null, maxlength: 2000 })
  description!: string | null;

  @Prop({ type: [Number], default: [] })
  memberUserIds!: number[];

  @Prop({ type: Number, required: true, index: true })
  createdByUserId!: number;

  @Prop({ type: Number, required: true })
  updatedByUserId!: number;

  @Prop({ type: Number, default: 1 })
  version!: number;

  @Prop({ type: Boolean, default: false, index: true })
  isArchived!: boolean;

  @Prop({ type: Date, default: null })
  archivedAt!: Date | null;

  @Prop({ type: Number, default: null })
  archivedByUserId!: number | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

GroupSchema.index({ createdByUserId: 1, isArchived: 1, updatedAt: -1 });
GroupSchema.index({ isArchived: 1, name: 1 });
GroupSchema.index({ memberUserIds: 1, isArchived: 1 });
