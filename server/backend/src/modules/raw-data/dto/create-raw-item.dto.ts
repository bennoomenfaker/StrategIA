import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { SourceType } from '../../../common/enums/source-type.enum';

export class CreateRawItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  contentRaw: string;

  @IsEnum(SourceType)
  @IsNotEmpty()
  sourceType: SourceType;

  @IsString()
  @IsNotEmpty()
  sourceUrl: string;

  @IsString()
  @IsNotEmpty()
  hash: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  collectionPlanId: string;
}
