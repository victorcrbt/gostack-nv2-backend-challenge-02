import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateTransactionsTable1588947605119
  implements MigrationInterface {
  private tableName = 'transactions';

  private table = new Table({
    name: this.tableName,
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      {
        name: 'category_id',
        type: 'uuid',
        isNullable: true,
      },
      {
        name: 'title',
        type: 'varchar',
      },
      {
        name: 'type',
        type: 'enum',
        enum: ['income', 'outcome'],
      },
      {
        name: 'value',
        type: 'float',
      },
      {
        name: 'created_at',
        type: 'timestamp',
        default: 'now()',
      },
      {
        name: 'updated_at',
        type: 'timestamp',
        default: 'now()',
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(this.table);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(this.tableName);

    await queryRunner.query('DROP EXTENSION "uuid-ossp"');
  }
}
