// База знаний
let knowledgeBase = null;

// Загрузка базы знаний при старте
async function loadKnowledgeBase() {
    try {
        const response = await fetch('knowledgebase.json');
        const data = await response.json();
        knowledgeBase = data.knowledge_base;
        console.log('✅ База знаний загружена успешно');
        console.log(`📚 Всего категорий: ${Object.keys(knowledgeBase.categories).length}`);
    } catch (error) {
        console.error('❌ Ошибка загрузки базы знаний:', error);
        // Если не удалось загрузить, используем минимальную базу
        knowledgeBase = {
            categories: {},
            greetings: [
                {
                    keywords: ["привет", "здравствуй"],
                    responses: ["Привет! Как дела?"]
                }
            ],
            default_responses: [
                "Извини, у меня возникли проблемы с загрузкой базы знаний. Попробуй перезагрузить страницу."
            ]
        };
    }
}

// Инициализация при загрузке страницы
window.onload = function () {
    loadKnowledgeBase();
    console.log('🤖 AI Помощник запущен');
};

// Отправка сообщения
function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (message === '') {
        // Если пустое сообщение, анимируем поле ввода
        input.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            input.style.borderColor = '#e0e0e0';
        }, 300);
        return;
    }

    // Добавляем сообщение пользователя
    addMessage(message, 'user');
    input.value = '';

    // Показываем индикатор печати
    showTypingIndicator();

    // Имитация задержки ответа (как настоящий AI)
    const delay = 500 + Math.random() * 1000;
    setTimeout(() => {
        const response = getResponse(message);
        hideTypingIndicator();
        addMessage(response, 'bot');
    }, delay);
}

// Добавление сообщения в чат
function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    // Прокрутка вниз с плавной анимацией
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

// Показать индикатор печати
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator active';
    indicator.innerHTML = '<span></span><span></span><span></span>';

    typingDiv.appendChild(indicator);
    messagesContainer.appendChild(typingDiv);

    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

// Скрыть индикатор печати
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Получение ответа от AI (основная логика)
function getResponse(userMessage) {
    if (!knowledgeBase) {
        return "База знаний ещё загружается, подожди немного... ⏳";
    }

    const lowerMessage = userMessage.toLowerCase();

    // Проверка приветствий
    for (const greeting of knowledgeBase.greetings) {
        for (const keyword of greeting.keywords) {
            if (lowerMessage.includes(keyword)) {
                return getRandomResponse(greeting.responses);
            }
        }
    }

    // Поиск в категориях знаний
    let bestMatch = null;
    let maxMatches = 0;

    for (const category in knowledgeBase.categories) {
        const questions = knowledgeBase.categories[category];

        for (const item of questions) {
            let matchCount = 0;

            // Подсчитываем количество совпадающих ключевых слов
            for (const keyword of item.keywords) {
                if (lowerMessage.includes(keyword)) {
                    matchCount++;
                }
            }

            // Если нашли больше совпадений, обновляем лучший результат
            if (matchCount > maxMatches) {
                maxMatches = matchCount;
                bestMatch = item.answer;
            }
        }
    }

    // Если нашли хотя бы одно совпадение
    if (bestMatch) {
        return bestMatch;
    }

    // Если ничего не найдено, возвращаем случайный ответ по умолчанию
    return getRandomResponse(knowledgeBase.default_responses);
}

// Получить случайный элемент из массива
function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

// Обработка нажатия Enter
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Отправка подсказки
function sendSuggestion(text) {
    document.getElementById('userInput').value = text;
    sendMessage();
}

// Очистка чата (дополнительная функция)
function clearChat() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = `
        <div class="message bot">
            <div class="message-content">
                Чат очищен! Задавай новые вопросы 😊
            </div>
        </div>
    `;
}

// Экспорт чата (дополнительная функция)
function exportChat() {
    const messages = document.querySelectorAll('.message');
    let chatText = 'Экспорт чата AI Помощник\n\n';

    messages.forEach(msg => {
        const sender = msg.classList.contains('user') ? 'Пользователь' : 'AI';
        const text = msg.querySelector('.message-content').textContent;
        chatText += `${sender}: ${text}\n\n`;
    });

    // Создаем и скачиваем файл
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Подсчет статистики (для отладки)
function getStats() {
    if (!knowledgeBase) {
        console.log('База знаний не загружена');
        return;
    }

    let totalQuestions = 0;
    console.log('📊 Статистика базы знаний:');

    for (const category in knowledgeBase.categories) {
        const count = knowledgeBase.categories[category].length;
        totalQuestions += count;
        console.log(`  ${category}: ${count} вопросов`);
    }

    console.log(`\n✨ Всего вопросов: ${totalQuestions}`);
    console.log(`👋 Приветствий: ${knowledgeBase.greetings.length}`);
}

// Дополнительные полезные функции
const AIHelper = {
    // Получить все доступные категории
    getCategories: function () {
        if (!knowledgeBase) return [];
        return Object.keys(knowledgeBase.categories);
    },

    // Получить вопросы по категории
    getQuestionsByCategory: function (category) {
        if (!knowledgeBase || !knowledgeBase.categories[category]) return [];
        return knowledgeBase.categories[category];
    },

    // Поиск по ключевому слову
    search: function (keyword) {
        if (!knowledgeBase) return [];

        const results = [];
        for (const category in knowledgeBase.categories) {
            const questions = knowledgeBase.categories[category];

            for (const item of questions) {
                if (item.keywords.includes(keyword.toLowerCase()) ||
                    item.question.toLowerCase().includes(keyword.toLowerCase()) ||
                    item.answer.toLowerCase().includes(keyword.toLowerCase())) {
                    results.push({
                        category: category,
                        question: item.question,
                        answer: item.answer
                    });
                }
            }
        }

        return results;
    }
};

// Экспортируем для использования в консоли
window.AIHelper = AIHelper;
window.getStats = getStats;
window.clearChat = clearChat;
window.exportChat = exportChat;

console.log('💡 Доступные команды в консоли:');
console.log('  getStats() - показать статистику');
console.log('  clearChat() - очистить чат');
console.log('  exportChat() - экспортировать чат');
console.log('  AIHelper.search("слово") - поиск по базе');