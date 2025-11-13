const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware для разбора JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Массив для хранения полученных форм
let submissions = [];

// Статические файлы
app.use(express.static('public'));

// Главная страница - список полученных форм
app.get('/', (req, res) => {
let html = `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Полученные формы</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
body { background: #f5f7fa; padding: 20px; }
.container { max-width: 1200px; margin: 0 auto; }
header { text-align: center; margin-bottom: 30px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
h1 { color: #2c3e50; margin-bottom: 10px; }
.submission { background: white; margin-bottom: 20px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.field { margin-bottom: 10px; }
.label { font-weight: bold; color: #2c3e50; }
.value { color: #34495e; }
.timestamp { color: #7f8c8d; font-size: 12px; margin-top: 10px; }
.empty { text-align: center; color: #7f8c8d; padding: 40px; }
.delete-btn { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 10px; }
.delete-btn:hover { background: #c0392b; }
</style>
</head>
<body>
<div class="container">
<header>
<h1>📨 Полученные формы обратной связи</h1>
<p>Всего получено форм: ${submissions.length}</p>
</header>
`;

if (submissions.length === 0) {
html += `
<div class="submission empty">
<h3>📭 Форм пока нет</h3>
<p>Отправьте форму с главной страницы, чтобы увидеть данные здесь</p>
</div>
`;
} else {
submissions.forEach((submission, index) => {
html += `
<div class="submission">
<div class="field">
<span class="label">ФИО:</span>
<span class="value">${submission.fullName}</span>
</div>
<div class="field">
<span class="label">Email:</span>
<span class="value">${submission.email}</span>
</div>
<div class="field">
<span class="label">Телефон:</span>
<span class="value">${submission.phone}</span>
</div>
<div class="field">
<span class="label">Организация:</span>
<span class="value">${submission.organization}</span>
</div>
<div class="field">
<span class="label">Сообщение:</span>
<div class="value" style="margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 4px;">${submission.message}</div>
</div>
<div class="field">
<span class="label">Согласие с политикой:</span>
<span class="value">${submission.consent ? '✅ Да' : '❌ Нет'}</span>
</div>
<div class="timestamp">
📅 Получено: ${new Date(submission.timestamp).toLocaleString('ru-RU')}
</div>
<button class="delete-btn" onclick="deleteSubmission(${index})">Удалить</button>
</div>
`;
});
}

html += `
</div>
<script>
function deleteSubmission(index) {
if (confirm('Удалить эту форму?')) {
fetch('/delete/' + index, { method: 'DELETE' })
.then(() => location.reload());
}
}
</script>
</body>
</html>
`;

res.send(html);
});

// Эндпоинт для приема данных формы
app.post('/submit', (req, res) => {
const formData = {
...req.body,
timestamp: new Date().toISOString(),
id: Date.now()
};

submissions.unshift(formData); // Добавляем в начало массива

console.log('📨 Получена новая форма:');
console.log('ФИО:', formData.fullName);
console.log('Email:', formData.email);
console.log('Телефон:', formData.phone);
console.log('Организация:', formData.organization);
console.log('Сообщение:', formData.message);
console.log('Согласие:', formData.consent);
console.log('Время:', formData.timestamp);
console.log('---');

res.json({
success: true,
message: 'Форма успешно отправлена!',
totalSubmissions: submissions.length
});
});

// Эндпоинт для удаления формы
app.delete('/delete/:index', (req, res) => {
const index = parseInt(req.params.index);
if (index >= 0 && index < submissions.length) {
submissions.splice(index, 1);
res.json({ success: true });
} else {
res.status(404).json({ success: false, error: 'Форма не найдена' });
}
});

// Эндпоинт для получения всех форм (API)
app.get('/api/submissions', (req, res) => {
res.json(submissions);
});

app.listen(port, () => {
console.log(`🚀 Сервер запущен на http://localhost:${port}`);
console.log(`📊 Просмотр форм: http://localhost:${port}`);
});