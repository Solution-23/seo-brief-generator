import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { Storage } from '../../core/ports/Storage';
import { SEOBriefExport } from '../../core/entities/SEOBrief';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

// sql.js — это SQLite, скомпилированный в WASM. В отличие от better-sqlite3
// ему не нужна нативная сборка под конкретную ОС/версию Node — работает одинаково
// везде "из коробки". Плата за это: база живёт в памяти, поэтому после каждой
// записи мы вручную сохраняем её на диск в файл .db.
export class SQLiteStorage implements Storage {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;
  private initPromise: Promise<void>;

  constructor() {
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = join(dataDir, 'briefs.db');
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    const SQL = await initSqlJs();

    if (existsSync(this.dbPath)) {
      const fileBuffer = readFileSync(this.dbPath);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }

    this.db.run(`
      CREATE TABLE IF NOT EXISTS briefs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        keyword TEXT NOT NULL,
        markdown TEXT NOT NULL,
        json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private async ensureInitialized(): Promise<SqlJsDatabase> {
    await this.initPromise;
    if (!this.db) {
      throw new Error('SQLiteStorage: база данных не инициализирована');
    }
    return this.db;
  }

  private persist(db: SqlJsDatabase): void {
    const data = db.export();
    writeFileSync(this.dbPath, Buffer.from(data));
  }

  async save(brief: SEOBriefExport): Promise<void> {
    const db = await this.ensureInitialized();

    db.run(
      `INSERT INTO briefs (keyword, markdown, json) VALUES (?, ?, ?)`,
      [brief.json.targetKeyword, brief.markdown, JSON.stringify(brief.json)]
    );

    this.persist(db);
  }

  async getHistory(keyword: string): Promise<SEOBriefExport[]> {
    const db = await this.ensureInitialized();

    const stmt = db.prepare('SELECT * FROM briefs WHERE keyword = ? ORDER BY created_at DESC');
    stmt.bind([keyword]);

    const results: SEOBriefExport[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as { markdown: string; json: string };
      results.push({
        markdown: row.markdown,
        json: JSON.parse(row.json),
      });
    }
    stmt.free();

    return results;
  }
}
