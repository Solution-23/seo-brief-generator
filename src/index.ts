import OpenAI from 'openai';

// API Ключ 
const POLZA_API_KEY = 'pza_XYRvzLSf6rftco-ge8stL2YviwXtd6n8'
const client = new OpenAI ({

	baseURL:'https://api.polza.ai/v1',
	apiKey: POLZA_API_KEY, 
})




async function analyzerUrl(url: string) {
	console.log(`Скачиваю страницу: ${url}`)
// 1. Downloading HTML (Качаем HTML страницы)
const response = await fetch(url);
if (!response.ok) {
	throw new Error(`Не удалось загрузить страницу: ${response.statusText}`)
}
const html = await response.text();
const truncatedHtml = html.slice(0, 15000);

// 2. AI-powered analysis (Отправка нейросети запрос на анализ)
console.log(`Анализирую с помощью ИИ...`);

const completion = await client.chat.completions.create({
	// пока что модель будет gpt-4o-mini
	model: 'gpt-4o-mini',
	messages: [
		{
			role: 'system',
			content: 'Ты — SEO-эксперт. Твоя задача проанализировать HTML-код страницы и вернуть строго JSON без лишнего текста. Поля: title (заголовок страницы), metaDescription, h1, wordCount (примерное количество слов основного текста), topKeywords (массив из 5 ключевых слов), headings (массив всех заголовков h2), hasCanonical (true/false). Если каких-то данных нет, оставь пустую строку или false.'
		},
		{
			role: 'user',
			content: `Проанализируй следующий HTML и верни JSON:\n\n${truncatedHtml}`
		}	
	], 
	temperature: 0.1 // Response accuracy multiplier
});

// Receive the response and turn it into an object ( Получаем ответ и превращаем его в объект )
const text = completion.choices[0]?.message?.content || '';

try {
	const seoData = JSON.parse(jsonText);
	return seoData;
} catch (e) {
	console.error('Не удалось распарсить овтет нейросети', text);
	throw new Error('Нейросеть вернула невалидный JSON');
	}
}