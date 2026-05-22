import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { Storage } from '../../core/ports/Storage';
import { SEOBriefExport } from '../../core/entities/SEOBrief';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export class SQLiteStorage implements Storage {
  private db: Database;
  private static sqlJs: SqlJsStatic;
  private dbPath: string;

  private static async initializeSqlJs(): Promise<void> {
    if (!SQLiteStorage.sqlJs) {
      SQLiteStorage.sqlJs = await initSqlJs({
        locateFile: file => join(__dirname, '..', '..', '..', 'node_modules', 'sql.js', 'dist', file)
      });
    }
  }

  constructor() {
    this.dbPath = join(process.cwd(), 'data', 'briefs.db');
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await SQLiteStorage.initializeSqlJs();

    if (!existsSync(join(process.cwd(), 'data'))) {
      mkdirSync(join(process.cwd(), 'data'), { recursive: true });
    }

    if (existsSync(this.dbPath)) {
      const fileBuffer = readFileSync(this.dbPath);
      this.db = new SQLiteStorage.sqlJs.Database(fileBuffer);
    } else {
      this.db = new SQLiteStorage.sqlJs.Database();
      this.initDB();
      this.saveDbToFile();
    }
  }

  private initDB(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS briefs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        keyword TEXT NOT NULL,
        json TEXT NOT NULL,
        markdown TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
  }

  private saveDbToFile(): void {
    const data = this.db.export();
    writeFileSync(this.dbPath, Buffer.from(data));
  }

  async save(brief: SEOBriefExport): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO briefs (keyword, json, markdown, createdAt)
      VALUES (?, ?, ?, ?)
    `);
    stmt.bind([
      brief.json.targetKeyword,
      JSON.stringify(brief.json),
      brief.markdown,
      new Date().toISOString()
    ]);
    stmt.step();
    stmt.free();

    this.saveDbToFile();
  }

  async getHistory(keyword: string): Promise<SEOBriefExport[]> {
    const stmt = this.db.prepare(`
      SELECT json, markdown FROM briefs
      WHERE keyword = ?
      ORDER BY createdAt DESC
    `);
    stmt.bind([keyword]);

    const results: SEOBriefExport[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        json: JSON.parse(row.json as string) as SEOBriefExport['json'],
        markdown: row.markdown as string
      });
    }
    stmt.free();

    return results;
  }
}
