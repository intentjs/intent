/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.string('id').primary();
    table.string('first_name');
    table.string('last_name');
    table.string('email').notNullable().index();
    table.string('password').notNullable();
    table.timestamp('email_verified_at').nullable();
    table.timestamp('password_changed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
