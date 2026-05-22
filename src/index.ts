import { DIContainer } from './di/container';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  try {
    // Создаём папку для данных
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    const keyword = process.argv[2];
    if (!keyword) {
      throw new Error('Укажите ключевое слово: node index.js "seo"');
    }

    const container = DIContainer.getInstance();
    const useCase = container.getUseCase();

    console.log(`🔍 Генерация SEO-брифа для ключевого слова: ${keyword}`);
    const brief = await useCase.execute(keyword);

    console.log('✅ Бриф сгенерирован!');
    console.log('📄 Markdown-версия:');
    console.log(brief.markdown);
    console.log('\n💾 Сохранено в SQLite и JSON.');
  } catch (error) {
    console.error('❌ Ошибка:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
