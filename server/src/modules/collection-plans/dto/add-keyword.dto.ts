import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { KeywordType } from '../../../common/enums/keyword-type.enum';

export class AddKeywordDto {
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @IsEnum(KeywordType)
  @IsNotEmpty()
  keywordType: KeywordType;
}
