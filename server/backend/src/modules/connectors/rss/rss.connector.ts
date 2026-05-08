import { Injectable } from '@nestjs/common';
import { IConnector, ConnectorConfig } from '../interfaces/connector.interface';
import { SourceType } from '../../../common/enums/source-type.enum';
import { CollectionResult } from '../../../common/interfaces/collection-result.interface';

@Injectable()
export class RssConnector implements IConnector {
  type = SourceType.RSS;

  async collect(_config: ConnectorConfig): Promise<CollectionResult[]> {
    return [];
  }

  validate(_url: string): boolean {
    return true;
  }
}
