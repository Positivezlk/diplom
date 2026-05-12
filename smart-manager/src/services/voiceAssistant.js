const CREATE_PATTERNS = [
  'создай задачу',
  'создать задачу',
  'добавь задачу',
  'добавить задачу',
  'новая задача',
  'запиши задачу',
  'поставь задачу',
]

const WEEKDAYS = {
  понедельник: 1,
  понедельника: 1,
  вторник: 2,
  вторника: 2,
  среду: 3,
  среда: 3,
  среды: 3,
  четверг: 4,
  четверга: 4,
  пятницу: 5,
  пятница: 5,
  пятницы: 5,
  субботу: 6,
  суббота: 6,
  субботы: 6,
  воскресенье: 0,
  воскресенья: 0,
}

const MONTHS = {
  января: 0,
  январь: 0,
  февраля: 1,
  февраль: 1,
  марта: 2,
  март: 2,
  апреля: 3,
  апрель: 3,
  мая: 4,
  май: 4,
  июня: 5,
  июнь: 5,
  июля: 6,
  июль: 6,
  августа: 7,
  август: 7,
  сентября: 8,
  сентябрь: 8,
  октября: 9,
  октябрь: 9,
  ноября: 10,
  ноябрь: 10,
  декабря: 11,
  декабрь: 11,
}

const PRIORITY_RULES = [
  { priority: 'critical', words: ['критический', 'критическим', 'критичным', 'очень срочный', 'очень срочную', 'очень срочным', 'максимальный', 'максимальным'] },
  { priority: 'high', words: ['высокий', 'высоким', 'важный', 'важным', 'срочный', 'срочным', 'срочную'] },
  { priority: 'low', words: ['низкий', 'низким', 'неважный', 'неважным'] },
  { priority: 'medium', words: ['средний', 'средним', 'обычный', 'обычным', 'нормальный', 'нормальным'] },
]

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[.,!?;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function capitalizeTitle(text) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(baseDate, days) {
  const date = new Date(baseDate)
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

function getNextWeekday(baseDate, targetDay) {
  const currentDay = baseDate.getDay()
  let diff = targetDay - currentDay
  if (diff <= 0) diff += 7
  return addDays(baseDate, diff)
}

function extractPriority(text) {
  for (const rule of PRIORITY_RULES) {
    if (rule.words.some((word) => text.includes(word))) return rule.priority
  }
  return 'medium'
}

function extractDeadline(text, now = new Date()) {
  if (/(^|\s)послезавтра($|\s)/.test(text)) return toDateInputValue(addDays(now, 2))
  if (/(^|\s)завтра($|\s)/.test(text)) return toDateInputValue(addDays(now, 1))
  if (/(^|\s)сегодня($|\s)/.test(text)) return toDateInputValue(addDays(now, 0))

  const weekdayMatch = text.match(/(?:^|\s)(?:до|на)\s+(понедельник|понедельника|вторник|вторника|среду|среда|среды|четверг|четверга|пятницу|пятница|пятницы|субботу|суббота|субботы|воскресенье|воскресенья)(?:$|\s)/)
  if (weekdayMatch) return toDateInputValue(getNextWeekday(now, WEEKDAYS[weekdayMatch[1]]))

  const dateMatch = text.match(/(?:^|\s)(\d{1,2})\s+(января|январь|февраля|февраль|марта|март|апреля|апрель|мая|май|июня|июнь|июля|июль|августа|август|сентября|сентябрь|октября|октябрь|ноября|ноябрь|декабря|декабрь)(?:$|\s)/)
  if (dateMatch) {
    const day = Number(dateMatch[1])
    const month = MONTHS[dateMatch[2]]
    const currentYear = now.getFullYear()
    let date = new Date(currentYear, month, day, 12, 0, 0, 0)

    if (Number.isNaN(date.getTime()) || date.getMonth() !== month || date.getDate() !== day) return null

    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    if (date < today) date = new Date(currentYear + 1, month, day, 12, 0, 0, 0)
    return toDateInputValue(date)
  }

  return null
}

function stripServiceWords(text) {
  let result = text

  for (const phrase of CREATE_PATTERNS) {
    result = result.replaceAll(phrase, ' ')
  }

  return result
    .replace(/(?:^|\s)с\s+(?:очень\s+срочным|критическим|максимальным|высоким|средним|низким|обычным|нормальным|важным|срочным|неважным)\s+приоритетом(?:$|\s)/g, ' ')
    .replace(/(?:^|\s)(?:очень\s+срочный|критический|максимальный|высокий|средний|низкий|обычный|нормальный|важный|срочный|неважный)\s+приоритет(?:$|\s)/g, ' ')
    .replace(/(?:^|\s)(?:послезавтра|завтра|сегодня)(?:$|\s)/g, ' ')
    .replace(/(?:^|\s)(?:до|на)\s+(?:понедельник|понедельника|вторник|вторника|среду|среда|среды|четверг|четверга|пятницу|пятница|пятницы|субботу|суббота|субботы|воскресенье|воскресенья)(?:$|\s)/g, ' ')
    .replace(/(?:^|\s)\d{1,2}\s+(?:января|январь|февраля|февраль|марта|март|апреля|апрель|мая|май|июня|июнь|июля|июль|августа|август|сентября|сентябрь|октября|октябрь|ноября|ноябрь|декабря|декабрь)(?:$|\s)/g, ' ')
    .replace(/(?:^|\s)(?:с|со)\s+$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseVoiceTaskCommand(rawText, now = new Date()) {
  const normalized = normalizeText(rawText)

  if (!normalized) return { ok: false, reason: 'empty', message: 'Не удалось распознать речь. Попробуйте ещё раз' }

  const hasCreateIntent = CREATE_PATTERNS.some((phrase) => normalized.includes(phrase))
  if (!hasCreateIntent) {
    return {
      ok: false,
      reason: 'unknown_intent',
      message: 'Я не понял задачу. Попробуйте сказать: "Создай задачу купить продукты завтра"',
    }
  }

  const title = capitalizeTitle(stripServiceWords(normalized))
  if (!title) return { ok: false, reason: 'empty_title', message: 'Я не понял название задачи' }

  return {
    ok: true,
    task: {
      title,
      description: '',
      priority: extractPriority(normalized),
      deadline: extractDeadline(normalized, now),
      status: 'todo',
    },
  }
}

export function isSpeechRecognitionSupported() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition
}
