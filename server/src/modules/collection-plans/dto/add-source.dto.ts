import { IsNotEmpty, IsString, IsEnum, IsUrl } from 'class-validator';
import { SourceType } from '../../../common/enums/source-type.enum';

export class AddSourceDto {
  @IsEnum(SourceType)
  @IsNotEmpty()
  sourceType: SourceType;

  @IsString()
  @IsNotEmpty()
  sourceLabel: string;

  @IsUrl()
  @IsNotEmpty()
  sourceUrl: string;
}
