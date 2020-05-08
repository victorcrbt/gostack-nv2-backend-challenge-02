import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class AddForeignKeyToTransactionsTable1588949758328
  implements MigrationInterface {
  private tableName = 'transactions';

  private foreignKeyName = 'transaction_category';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createForeignKey(
      this.tableName,
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        name: this.foreignKeyName,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropForeignKey(this.tableName, this.foreignKeyName);
  }
}
