/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async function (knex) {
  const migration = await knex.schema.createTableIfNotExists(
    'intent_jobs',
    (table) => {
      table.string('id', 26).index().primary();
      table.string('queue').index();
      table.jsonb('payload');
      table.bigint('scheduled_at').defaultTo(0);
      table.index(['queue', 'scheduled_at']);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    },
  );
  return migration;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.schema.dropTableIfExists('intent_jobs');
};
