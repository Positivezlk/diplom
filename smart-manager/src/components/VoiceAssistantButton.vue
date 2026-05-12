<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { getSpeechRecognitionConstructor, isSpeechRecognitionSupported, parseVoiceTaskCommand } from '@/services/voiceAssistant'
import { useTasksStore } from '@/stores/tasks'
import { useUiStore } from '@/stores/ui'

const USE_VOICE_AUDIO_FILES = false
const RESPONSE_AUDIO = {
  success: '/voice/task-created.mp3',
  notUnderstood: '/voice/not-understood.mp3',
  microphoneError: '/voice/microphone-error.mp3',
  createError: '/voice/create-error.mp3',
}

const tasks = useTasksStore()
const ui = useUiStore()

const mode = ref('idle')
const transcript = ref('')
const statusText = ref('Нажмите и скажите задачу')
const resultText = ref('')
const recognition = ref(null)
const resetTimer = ref(null)

const isListening = computed(() => mode.value === 'listening')
const isProcessing = computed(() => mode.value === 'processing')
const isDisabled = computed(() => isProcessing.value)
const buttonText = computed(() => {
  if (isListening.value) return 'Слушаю...'
  if (isProcessing.value) return 'Обрабатываю...'
  return 'Голосом'
})

function scheduleReset() {
  if (resetTimer.value) window.clearTimeout(resetTimer.value)
  resetTimer.value = window.setTimeout(() => {
    if (mode.value !== 'listening') {
      mode.value = 'idle'
      statusText.value = 'Нажмите и скажите задачу'
      transcript.value = ''
      resultText.value = ''
    }
  }, 4200)
}

function getRussianVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || []
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith('ru')) || null
}

async function playAudioFile(path) {
  const audio = new Audio(path)
  await audio.play()
}

function speak(text, type = 'success') {
  if (USE_VOICE_AUDIO_FILES && RESPONSE_AUDIO[type]) {
    playAudioFile(RESPONSE_AUDIO[type]).catch(() => speakWithSynthesis(text))
    return
  }

  speakWithSynthesis(text)
}

function speakWithSynthesis(text) {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ru-RU'
  utterance.rate = 0.95
  utterance.pitch = 1

  const voice = getRussianVoice()
  if (voice) utterance.voice = voice

  window.speechSynthesis.speak(utterance)
}

function showError(message, speechText = message, speechType = 'notUnderstood') {
  mode.value = 'error'
  statusText.value = message
  resultText.value = ''
  ui.pushToast({ title: message, type: 'error' })
  speak(speechText, speechType)
  scheduleReset()
}

async function createTaskFromTranscript(text) {
  mode.value = 'processing'
  statusText.value = 'Обрабатываю команду...'
  transcript.value = text

  const parsed = parseVoiceTaskCommand(text)
  if (!parsed.ok) {
    showError(parsed.message, parsed.reason === 'empty_title' ? 'Я не понял название задачи' : 'Я не понял задачу')
    return
  }

  resultText.value = `Создаю задачу: ${parsed.task.title}`

  try {
    await tasks.addTask(parsed.task, { notify: false })
    mode.value = 'success'
    statusText.value = 'Задача создана голосом'
    ui.pushToast({ title: 'Задача создана голосом', description: parsed.task.title })
    speak('Задача создана', 'success')
    scheduleReset()
  } catch (error) {
    showError('Не удалось создать задачу', 'Не удалось создать задачу', 'createError')
  }
}

function startListening() {
  if (isDisabled.value || isListening.value) return

  if (!isSpeechRecognitionSupported()) {
    showError('Ваш браузер не поддерживает голосовой ввод. Попробуйте открыть сайт в Chrome или Edge.', 'Ваш браузер не поддерживает голосовой ввод', 'microphoneError')
    return
  }

  const SpeechRecognition = getSpeechRecognitionConstructor()
  const instance = new SpeechRecognition()
  recognition.value = instance

  transcript.value = ''
  resultText.value = ''
  mode.value = 'listening'
  statusText.value = 'Слушаю вас...'

  instance.lang = 'ru-RU'
  instance.interimResults = false
  instance.continuous = false
  instance.maxAlternatives = 1

  instance.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript?.trim() || ''
    if (!text) {
      showError('Не удалось распознать речь. Попробуйте ещё раз', 'Не удалось распознать речь', 'notUnderstood')
      return
    }

    createTaskFromTranscript(text)
  }

  instance.onerror = (event) => {
    const isPermissionError = event.error === 'not-allowed' || event.error === 'service-not-allowed'
    const message = isPermissionError ? 'Доступ к микрофону запрещён' : 'Не удалось включить микрофон'
    showError(message, message, 'microphoneError')
  }

  instance.onend = () => {
    if (mode.value === 'listening') {
      showError('Не удалось распознать речь. Попробуйте ещё раз', 'Не удалось распознать речь', 'notUnderstood')
    }
  }

  try {
    instance.start()
  } catch (error) {
    showError('Не удалось включить микрофон', 'Не удалось включить микрофон', 'microphoneError')
  }
}

onBeforeUnmount(() => {
  if (resetTimer.value) window.clearTimeout(resetTimer.value)
  if (recognition.value) recognition.value.abort()
})
</script>

<template>
  <div class="voice-assistant">
    <button
      :class="['voice-assistant-button', { 'is-listening': isListening, 'is-processing': isProcessing }]"
      type="button"
      :disabled="isDisabled"
      title="Создать задачу голосом"
      @click="startListening"
    >
      <span class="voice-assistant-icon" aria-hidden="true">🎙</span>
      <span>{{ buttonText }}</span>
    </button>

    <Transition name="voice-popover-motion">
      <div v-if="mode !== 'idle'" class="voice-assistant-popover">
        <div class="voice-assistant-status">{{ statusText }}</div>
        <div v-if="transcript" class="voice-assistant-transcript">Вы сказали: «{{ transcript }}»</div>
        <div v-if="resultText" class="voice-assistant-result">{{ resultText }}</div>
      </div>
    </Transition>
  </div>
</template>
