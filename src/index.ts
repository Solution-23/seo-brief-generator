import { di } from './di.js';

async function main() {
  try {
    const keyword = process.argv[2];
    if (!keyword) {
      throw new Error('Укажите ключевое слово в аргументах: node index.js "seo"');
    }

    console.log(`🔍 Начинаю генерацию SEO-брифа для ключевого слова: ${keyword}`);
    const brief = await di.useCase.execute(keyword);
    console.log('✅ SEO-бриф успешно сгенерирован:', brief);
  } catch (error) {
    console.error('❌ Ошибка при генерации брифа:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
