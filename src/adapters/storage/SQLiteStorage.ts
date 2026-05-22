import Database from 'better-sqlite3';
import { Storage } from '../../core/ports/Storage';
import { SEOBriefExport } from '../../core/entities/SEOBrief';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class SQLiteStorage implements Storage {
  private db: Database.Database;

  constructor() {
    const dbPath = join(process.cwd(), 'data', 'briefs.db');
    if (!existsSync(join(process.cwd(), 'data'))) {
      mkdirSync(join(process.cwd(), 'data'), { recursive: true });
    }
    this.db = new Database(dbPath);
    this.initDB();
  }

  private initDB(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS briefs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        keyword TEXT NOT NULL,
        json TEXT NOT NULL,
        markdown TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
  }

  async save(brief: SEOBriefExport): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO briefs (keyword, json, markdown, createdAt)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(
      brief.json.targetKeyword,
      JSON.stringify(brief.json),
      brief.markdown,
      new Date().toISOString()
    );
  }

  async getHistory(keyword: string): Promise<SEOBriefExport[]> {
    const rows = this.db.prepare(`
      SELECT json, markdown FROM briefs
      WHERE keyword = ?
      ORDER BY createdAt DESC
    `).all(keyword) as Array<{ json: string; markdown: string }>;

    return rows.map(row => ({
      json: JSON.parse(row.json) as SEOBriefExport['json'],
      markdown: row.markdown
    }));
  }
}
