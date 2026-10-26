// DATA MIGRATION (flagged): nulls out ticket-sale links that point at reserved/placeholder
// domains (RFC 2606/6761: .demo, .test, .invalid, .example, .localhost). Those URLs can never
// resolve, so the chatbot was offering dead links during demos.
//
// Only touches eventos.linkVentaEntradas, and only rows whose value is a dead placeholder.
// Real URLs are left untouched. Idempotent: running it twice changes nothing the second time.
export async function up({ context: queryInterface, sequelize }) {
  if (sequelize.getDialect() !== 'postgres') return;
  const transaction = queryInterface.options?.transaction;

  await sequelize.query(
    `UPDATE eventos
        SET "linkVentaEntradas" = NULL,
            "updatedAt" = now()
      WHERE "linkVentaEntradas" IS NOT NULL
        AND (
          "linkVentaEntradas" ~* '^https?://([^/]*\\.)?(demo|test|invalid|example|localhost)(:[0-9]+)?(/|$)'
          OR "linkVentaEntradas" ~* '^https?://(www\\.)?(example\\.(com|org|net)|test\\.com|localhost)(:[0-9]+)?(/|$)'
        )`,
    { transaction }
  );
}

// Irreversible on purpose: the original placeholder values were never valid, so there is
// nothing meaningful to restore.
export async function down() {}
