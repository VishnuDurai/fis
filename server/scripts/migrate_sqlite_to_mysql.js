import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../fis.db');

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'srec_fis';

async function runMigration() {
  console.log('--- SREC FIS Database Migration: SQLite -> MySQL ---');

  if (!fs.existsSync(dbPath)) {
    console.error(`SQLite database file not found at ${dbPath}`);
    process.exit(1);
  }

  const sqliteDb = new sqlite3.Database(dbPath);

  let mysqlPool;
  try {
    const rootConn = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await rootConn.end();

    mysqlPool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      connectionLimit: 10
    });
    console.log(`Connected to MySQL target database "${MYSQL_DATABASE}" at ${MYSQL_HOST}:${MYSQL_PORT}`);
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    process.exit(1);
  }

  // Get list of tables from SQLite
  sqliteDb.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", async (err, tables) => {
    if (err) {
      console.error('Error fetching SQLite table list:', err.message);
      process.exit(1);
    }

    console.log(`Found ${tables.length} tables in SQLite to migrate...`);

    for (const { name: tableName } of tables) {
      try {
        const rows = await new Promise((resolve, reject) => {
          sqliteDb.all(`SELECT * FROM ${tableName}`, [], (sErr, sRows) => {
            if (sErr) reject(sErr);
            else resolve(sRows || []);
          });
        });

        // Get table info from SQLite
        const tableInfo = await new Promise((resolve, reject) => {
          sqliteDb.all(`PRAGMA table_info(\`${tableName}\`)`, [], (iErr, info) => {
            if (iErr) reject(iErr);
            else resolve(info || []);
          });
        });

        if (tableInfo.length > 0) {
          // Construct MySQL DDL matching SQLite columns dynamically
          const colDefs = tableInfo.map(col => {
            let type = (col.type || 'TEXT').toUpperCase();
            if (type.includes('INT')) type = 'INT';
            else if (type.includes('REAL') || type.includes('FLOAT') || type.includes('DOUBLE')) type = 'DOUBLE';
            else type = 'LONGTEXT';

            let isPk = col.pk > 0;
            if (isPk && col.name === 'id') {
              return `\`${col.name}\` INT AUTO_INCREMENT PRIMARY KEY`;
            } else if (isPk) {
              return `\`${col.name}\` VARCHAR(255) PRIMARY KEY`;
            }
            return `\`${col.name}\` ${type}`;
          });

          await mysqlPool.query(`DROP TABLE IF EXISTS \`${tableName}\``);
          const createDdl = `CREATE TABLE \`${tableName}\` (${colDefs.join(', ')}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
          await mysqlPool.query(createDdl);
        }

        if (rows.length === 0) {
          console.log(`- [${tableName}] 0 records (Table structure verified)`);
          continue;
        }

        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const colNames = columns.map(c => `\`${c}\``).join(', ');
        const insertSql = `REPLACE INTO \`${tableName}\` (${colNames}) VALUES (${placeholders})`;

        let insertedCount = 0;
        for (const row of rows) {
          const values = columns.map(col => row[col]);
          try {
            await mysqlPool.query(insertSql, values);
            insertedCount++;
          } catch (iErr) {
            console.error(`Error inserting into ${tableName}:`, iErr.code, iErr.message);
          }
        }

        console.log(`✓ [${tableName}] Successfully migrated ${insertedCount}/${rows.length} rows to MySQL.`);
      } catch (tErr) {
        console.error(`✗ [${tableName}] Migration failed:`, tErr.message);
      }
    }

    console.log('\n--- SQLite -> MySQL Data Migration Completed Successfully! ---');
    sqliteDb.close();
    await mysqlPool.end();
    process.exit(0);
  });
}

runMigration();
