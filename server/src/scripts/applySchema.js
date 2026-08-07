import fs from 'fs/promises';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

async function applySchema() {
    const schemaPath = path.resolve('database', 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');

    const connection = await mysql.createConnection({
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        multipleStatements: true,
        ssl: env.db.ssl
            ? {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true,
            }
            : undefined,
    });

    try {
        console.log(`Applying schema from ${schemaPath}...`);
        await connection.query(schemaSql);
        await applyIncrementalMigrations(connection);
        console.log('Database schema applied successfully.');
    } finally {
        await connection.end();
    }
}

async function columnExists(connection, tableName, columnName) {
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS count
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?`,
        [tableName, columnName],
    );

    return Number(rows[0]?.count || 0) > 0;
}

async function dropColumnIfPresent(connection, tableName, columnName) {
    if (await columnExists(connection, tableName, columnName)) {
        await connection.query(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
    }
}

async function foreignKeyExists(connection, tableName, constraintName) {
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS count
         FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND CONSTRAINT_NAME = ?
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
        [tableName, constraintName],
    );
    return Number(rows[0]?.count || 0) > 0;
}

async function dropForeignKeyIfPresent(connection, tableName, constraintName) {
    if (await foreignKeyExists(connection, tableName, constraintName)) {
        await connection.query(`ALTER TABLE ${tableName} DROP FOREIGN KEY ${constraintName}`);
    }
}

async function normalizeDisplayOrder(connection, tableName) {
    const [rows] = await connection.query(
        `SELECT MIN(display_order) AS minimum_order FROM ${tableName}`,
    );

    // Legacy CMS rows began at zero. Shift the full sequence together once.
    if (Number(rows[0]?.minimum_order) === 0) {
        await connection.query(`UPDATE ${tableName} SET display_order = display_order + 1`);
    }

    await connection.query(
        `ALTER TABLE ${tableName} MODIFY COLUMN display_order INT NOT NULL DEFAULT 1`,
    );
}

async function applyIncrementalMigrations(connection) {
    await dropColumnIfPresent(connection, 'profile', 'bio');
    await dropForeignKeyIfPresent(connection, 'profile', 'fk_profile_photo_media');
    await dropForeignKeyIfPresent(connection, 'profile', 'fk_profile_resume_media');
    for (const columnName of [
        'profile_photo_media_id',
        'resume_media_id',
        'github_url',
        'linkedin_url',
        'instagram_url',
        'twitter_url',
        'portfolio_url',
        'typing_roles',
        'stats',
    ]) {
        await dropColumnIfPresent(connection, 'profile', columnName);
    }
    if (!(await columnExists(connection, 'contacts', 'status'))) {
        await connection.query(
            `ALTER TABLE contacts
       ADD COLUMN status ENUM('unread', 'read', 'archived') NOT NULL DEFAULT 'unread' AFTER message`,
        );
    }

    if (!(await columnExists(connection, 'contacts', 'is_starred'))) {
        await connection.query(
            `ALTER TABLE contacts
       ADD COLUMN is_starred BOOLEAN NOT NULL DEFAULT FALSE AFTER status`,
        );
    }

    if (!(await columnExists(connection, 'activity_logs', 'description'))) {
        await connection.query(
            `ALTER TABLE activity_logs
       ADD COLUMN description VARCHAR(500) NULL AFTER entity_id`,
        );
    }

    if (!(await columnExists(connection, 'projects', 'subtitle'))) {
        await connection.query(
            `ALTER TABLE projects
       ADD COLUMN subtitle VARCHAR(255) NULL AFTER full_description`,
        );
    }

    await connection.query(
        `CREATE TABLE IF NOT EXISTS content_versions (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          entity_type VARCHAR(80) NOT NULL,
          entity_id BIGINT UNSIGNED NOT NULL,
          version_number INT UNSIGNED NOT NULL,
          snapshot JSON NOT NULL,
          summary VARCHAR(255) NULL,
          created_by BIGINT UNSIGNED NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_content_versions_created_by
            FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
          UNIQUE KEY uq_content_versions_entity_version (entity_type, entity_id, version_number),
          INDEX idx_content_versions_entity_created (entity_type, entity_id, created_at)
        )`,
    );

    for (const tableName of [
        'social_links',
        'hero_roles',
        'portfolio_stats',
        'skills',
        'projects',
        'project_gallery',
        'project_features',
        'project_responsibilities',
        'project_challenges',
        'project_future_improvements',
        'experiences',
        'education',
    ]) {
        await normalizeDisplayOrder(connection, tableName);
    }
}

applySchema().catch((error) => {
    console.error('Failed to apply schema:', error);
    process.exit(1);
});
