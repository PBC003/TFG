import { IsString, Length } from 'class-validator';

export class ImportGroupMembersDto {
  @IsString()
  @Length(1, 20_000)
  rawText!: string;
}
