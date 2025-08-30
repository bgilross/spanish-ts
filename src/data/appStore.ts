import { create } from "zustand"
import spanishData from "@/data/spanishData"
import type {
	Lesson,
	Sentence,
	SentenceDataEntry,
	QuizType,
	TranslatedWordEntry,
	ErrorEntry,
	SubmissionLog,
	CurrentSectionEntry,
} from "@/types/types"
import {
	sanitize,
	shuffle,
	getCurrentSectionsForSentence,
	isCorrectAnswer,
	findErrors,
	findErrorRefs,
	computeNextSectionIndex,
} from "@/data/quiz"

// Utils
function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n))
}

// Data slice
type DataSlice = {
	lessons: Lesson[]
	currentLessonIndex: number
	currentSentenceIndex: number // -1 when none
	currentLesson: Lesson | null
	currentSentence: Sentence | null

	setLessonIndex: (index: number) => void
	setSentenceIndex: (index: number) => void
	nextLesson: () => void
	prevLesson: () => void
	nextSentence: () => void
	prevSentence: () => void

	// Back-compat
	setCurrentLesson: (lesson: Lesson) => void
	setCurrentSentence: (sentence: Sentence) => void
}

// Quiz slice
type QuizSlice = {
	quizType: QuizType
	feedbackMode: boolean

	lessonNumber: number
	randomizedSentences: Sentence[]
	sentenceIndex: number
	currentSections: CurrentSectionEntry[]
	sectionIndex: number | null

	translatedWords: TranslatedWordEntry[]
	lessonLog: SubmissionLog[]
	errors: ErrorEntry[]

	showFeedbackModal: boolean
	showScoreModal: boolean
	userInput: string

	startQuiz: (lesson: Lesson, quizType?: QuizType) => void
	setQuizType: (mode: QuizType) => void
	setUserInput: (val: string) => void
	handleUserSubmit: (input?: string) => void
	closeFeedbackModal: () => void
	closeScoreModal: () => void

	getNextSection: (
		sentenceIdx?: number,
		translated?: TranslatedWordEntry[]
	) => number | null
	getNextSentence: (nextIndex?: number) => void
}

// UI slice
type UiSlice = {
	showLessonInfoModal: boolean
	openLessonInfoModal: () => void
	closeLessonInfoModal: () => void
}

// Combined
type AppState = DataSlice & QuizSlice & UiSlice

// Initial Data
const lessons = spanishData.lessons
const initialLessonIndex = clamp(2, 0, Math.max(0, lessons.length - 1))
const initialLesson = lessons[initialLessonIndex] ?? null
const initialSentenceIndex = initialLesson?.sentences?.length ? 0 : -1
const initialSentence =
	initialSentenceIndex >= 0
		? initialLesson!.sentences![initialSentenceIndex]
		: null

// Initial Quiz
const initialRandomized = shuffle(
	(initialLesson?.sentences ?? []) as Sentence[]
)
const initialSections = initialRandomized.length
	? getCurrentSectionsForSentence(initialRandomized[0])
	: []

export const useAppStore = create<AppState>((set, get) => ({
	// Data slice
	lessons,
	currentLessonIndex: initialLessonIndex,
	currentSentenceIndex: initialSentenceIndex,
	currentLesson: initialLesson,
	currentSentence: initialSentence,

	setLessonIndex: (index: number) => {
		const idx = clamp(index, 0, lessons.length - 1)
		const lesson = lessons[idx] ?? null
		const sentenceIndex = lesson?.sentences?.length ? 0 : -1
		const sentence =
			sentenceIndex >= 0
				? (lesson!.sentences![sentenceIndex] as Sentence)
				: null
		set({
			currentLessonIndex: idx,
			currentLesson: lesson,
			currentSentenceIndex: sentenceIndex,
			currentSentence: sentence,
		})
		if (lesson) {
			get().startQuiz(lesson) // auto-start quiz on lesson change
		}
	},

	setSentenceIndex: (index: number) => {
		const lesson = get().currentLesson
		if (!lesson?.sentences?.length) return
		const idx = clamp(index, 0, lesson.sentences.length - 1)
		const sentence = lesson.sentences[idx] as Sentence
		set({ currentSentenceIndex: idx, currentSentence: sentence })
		// Keep quiz sentence in sync with the selector in the header (randomized index)
		if (get().randomizedSentences.length) {
			get().getNextSentence(idx)
		}
	},

	nextLesson: () => {
		const cur = get().currentLessonIndex
		if (cur < lessons.length - 1) {
			get().setLessonIndex(cur + 1)
		}
	},

	prevLesson: () => {
		const cur = get().currentLessonIndex
		if (cur > 0) {
			get().setLessonIndex(cur - 1)
		}
	},

	nextSentence: () => {
		const curIdx = get().currentSentenceIndex
		const lesson = get().currentLesson
		if (!lesson?.sentences?.length) return
		if (curIdx < lesson.sentences.length - 1) {
			get().setSentenceIndex(curIdx + 1)
		}
	},

	prevSentence: () => {
		const curIdx = get().currentSentenceIndex
		if (curIdx > 0) {
			get().setSentenceIndex(curIdx - 1)
		}
	},

	setCurrentLesson: (lesson: Lesson) => {
		const idx = lessons.findIndex((l) => l.lesson === lesson.lesson)
		if (idx >= 0) get().setLessonIndex(idx)
	},

	setCurrentSentence: (sentence: Sentence) => {
		const lesson = get().currentLesson
		if (!lesson?.sentences) return
		const idx = lesson.sentences.findIndex((s) => s.id === sentence.id)
		if (idx >= 0) get().setSentenceIndex(idx)
	},

	// Quiz slice
	quizType: "parts",
	feedbackMode: true,

	lessonNumber: initialLesson?.lesson ?? 1,
	randomizedSentences: initialRandomized,
	sentenceIndex: 0,
	currentSections: initialSections,
	sectionIndex: initialSections.length ? 0 : null,

	translatedWords: [],
	lessonLog: [],
	errors: [],

	showFeedbackModal: false,
	showScoreModal: false,
	userInput: "",

	startQuiz: (lesson, quizType) => {
		const mode = quizType ?? get().quizType
		const sentences = (lesson.sentences ?? []) as Sentence[]
		const randomized = shuffle(sentences)
		const firstSections = randomized.length
			? getCurrentSectionsForSentence(randomized[0])
			: []
		set({
			quizType: mode,
			lessonNumber: lesson.lesson,
			randomizedSentences: randomized,
			sentenceIndex: 0,
			currentSections: firstSections,
			sectionIndex: firstSections.length ? 0 : null,
			translatedWords: [],
			lessonLog: [],
			errors: [],
			showFeedbackModal: false,
			showScoreModal: false,
			userInput: "",
		})
	},

	setQuizType: (mode) => {
		const state = get()
		const currentSentence = state.randomizedSentences[state.sentenceIndex]
		const currentSections = getCurrentSectionsForSentence(currentSentence)

		let nextSection: number | null = null
		if (mode === "parts") {
			nextSection = state.getNextSection(state.sentenceIndex, [])
		}

		set({
			quizType: mode,
			currentSections,
			sectionIndex:
				mode === "parts"
					? nextSection ?? (currentSections.length ? 0 : null)
					: 0,
			translatedWords: [],
			showFeedbackModal: false,
		})
	},

	setUserInput: (val) => set({ userInput: val }),

	handleUserSubmit: (input) => {
		const state = get()
		const sentence = state.randomizedSentences[state.sentenceIndex]
		if (!sentence) return
		const sectionIdx = state.sectionIndex
		if (sectionIdx == null) return
		const currentSection = state.currentSections[sectionIdx]?.section
		if (!currentSection) return

		const provided = input ?? state.userInput
		const correct = isCorrectAnswer(
			state.quizType,
			provided,
			currentSection,
			sentence
		)

		const submissionLog: SubmissionLog = {
			lessonNumber: state.lessonNumber,
			sentenceIndex: state.sentenceIndex,
			sectionIndex: sectionIdx,
			quizType: state.quizType,
			feedbackMode: state.feedbackMode,
			sentence,
			section: currentSection,
			isCorrect: correct,
			userInput: provided,
		}
		set({ lessonLog: [...state.lessonLog, submissionLog] })

		if (correct) {
			let updatedTranslated = state.translatedWords
			if (state.quizType === "parts") {
				const t =
					"translation" in currentSection
						? currentSection.translation
						: undefined
				const words: string[] =
					typeof t === "string" || t == null
						? []
						: Array.isArray(t)
						? t.map((w) => w.word)
						: [t.word]

				const phrase =
					"phraseTranslation" in currentSection
						? Array.isArray(currentSection.phraseTranslation)
							? currentSection.phraseTranslation[0] ?? null
							: currentSection.phraseTranslation ?? null
						: null

				const entry: TranslatedWordEntry = {
					index: sectionIdx,
					words,
					phraseTranslation: phrase,
				}
				updatedTranslated = [...state.translatedWords, entry]
			}

			const nextSection = state.getNextSection(
				state.sentenceIndex,
				updatedTranslated
			)

			if (state.quizType === "parts" && nextSection !== null) {
				set({
					sectionIndex: nextSection,
					translatedWords: updatedTranslated,
					userInput: "",
				})
				return
			}

			set({ translatedWords: updatedTranslated, userInput: "" })
			state.getNextSentence(state.sentenceIndex + 1)
			return
		}

		const errorWords = findErrors({
			quizType: state.quizType,
			currentSection,
			currentSentence: sentence,
			userWords: provided.split(" ").map((w) => sanitize(w)),
			sectionInd: sectionIdx,
		})

		const references = findErrorRefs({
			quizType: state.quizType,
			currentSection,
			currentSentence: sentence,
			errorWords,
			sectionInd: sectionIdx,
		})

		const errorEntry: ErrorEntry = {
			userInput: provided,
			currentSentence: sentence,
			currentSection,
			lessonNumber: state.lessonNumber,
			errorWords,
			references,
			mode: state.quizType,
		}

		set({
			errors: [...state.errors, errorEntry],
			showFeedbackModal: true,
		})
	},

	closeFeedbackModal: () => set({ showFeedbackModal: false }),
	closeScoreModal: () => set({ showScoreModal: false }),

	getNextSection: (sentenceIdx, translated) => {
		const state = get()
		const sIdx = sentenceIdx ?? state.sentenceIndex
		const sentence = state.randomizedSentences[sIdx]
		return computeNextSectionIndex(
			sentence,
			translated ?? state.translatedWords
		)
	},

	getNextSentence: (nextIndex) => {
		const state = get()
		const idx = nextIndex ?? state.sentenceIndex + 1
		const hasMore = idx < state.randomizedSentences.length

		if (hasMore) {
			const nextSentence = state.randomizedSentences[idx]
			const nextSections = getCurrentSectionsForSentence(nextSentence)
			set({
				sentenceIndex: idx,
				currentSections: nextSections,
				sectionIndex: nextSections.length ? 0 : null,
				translatedWords: [],
				showFeedbackModal: false,
			})
		} else {
			set({ showScoreModal: true })
		}
	},

	// UI slice
	showLessonInfoModal: true,
	openLessonInfoModal: () => set({ showLessonInfoModal: true }),
	closeLessonInfoModal: () => set({ showLessonInfoModal: false }),
}))
