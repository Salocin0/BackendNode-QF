// Preserve existing answers while allowing uploaded documents to be stored as structured text.
export async function up({ context, sequelize }) {
  if (sequelize.getDialect() !== 'postgres') return;
  await sequelize.query('ALTER TABLE "RTARestriccions" ALTER COLUMN "respuesta" TYPE TEXT', { transaction: context.options?.transaction });
}
export async function down() {
  // Keep TEXT: narrowing to VARCHAR would truncate documents and existing long answers.
}
