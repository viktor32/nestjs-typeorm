import { Provider } from '@nestjs/common';
import { DataSource, DataSourceOptions, getMetadataArgsStorage } from 'typeorm';
import { getDataSourceToken, getRepositoryToken } from './common/typeorm.utils';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';

export function createTypeOrmProviders(
  entities?: EntityClassOrSchema[],
  dataSource?: DataSource | DataSourceOptions | string,
  namespace?: string,
): Provider[] {
  return (entities || []).map((entity) => ({
    provide: getRepositoryToken(entity, dataSource, namespace),
    useFactory: (dataSource: DataSource) => {
      return dataSource.options.type === 'mongodb'
        ? dataSource.getMongoRepository(entity)
        : dataSource.getRepository(entity);
    },
    inject: [getDataSourceToken(dataSource)],
    /**
     * Extra property to workaround dynamic modules serialisation issue
     * that occurs when "TypeOrm#forFeature()" method is called with the same number
     * of arguments and all entities share the same class names.
     */
    targetEntitySchema: getMetadataArgsStorage().tables.find(
      (item) => item.target === entity,
    ),
  }));
}
