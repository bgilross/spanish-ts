import { create } from "zustand"
import type {
	Lesson,
	Sentence,
	SentenceDataEntry,
	WordObject,
	QuizType,
	TranslatedWordEntry,
	ErrorWord,
	ErrorEntry,
	SubmissionLog,
	CurrentSectionEntry,
} from "@/types/types"

function sanitize(str: string) {
	return (str ?? "")
		.replace(/[.,/#!$%^&*;:{}=\-_`~()?']/g, "")
		.trim()
		.toLowerCase()
}

function shuffle<T>(arr: T[]): T[] {
	const a = arr.slice()
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[a[i], a[j]] = [a[j], a[i]]
	}
	return a
}

function getCurrentSectionsForSentence(
	sentence: Sentence | undefined
): CurrentSectionEntry[] {
	if (!sentence) return []
	return (sentence.data ?? [])
		.map((section, index) => {
			const hasTranslation =
				"translation" in section &&
				section.translation !== undefined &&
				section.translation !== null
			return hasTranslation ? { section, index } : null
		})
		.filter(Boolean) as CurrentSectionEntry[]
}

function isCorrectAnswer(
	quizType: QuizType,
	input: string,
	section: SentenceDataEntry,
	sentence: Sentence
): boolean {
	const cleanInput = sanitize(input)

	if (quizType === "parts") {
		const phrase =
			"phraseTranslation" in section ? section.phraseTranslation : undefined
		if (typeof phrase === "string" && phrase) {
			return cleanInput === sanitize(phrase)
		}
		if (Array.isArray(phrase) && phrase.length) {
			return phrase.map(sanitize).some((p) => p === cleanInput)
		}

		// Fall back to translation
		if ("translation" in section && section.translation != null) {
			const t = section.translation
			if (typeof t === "string") {
				return cleanInput === sanitize(t)
			} else if (Array.isArray(t)) {
				const joined = sanitize(t.map((w) => w.word).join(" "))
				if (joined.length > 0 && cleanInput === joined) return true
				const tokens = new Set(cleanInput.split(/\s+/).filter(Boolean))
				return t.every((w) => tokens.has(sanitize(w.word)))
			} else {
				return cleanInput === sanitize(t.word)
			}
		}
		return false
	}

	// Full sentence mode
	return cleanInput === sanitize(sentence.translation)
}

function findErrorsHelper(params: {
	quizType: QuizType
	currentSection: SentenceDataEntry
	currentSentence: Sentence
	userWords: string[]
	sectionInd: number
}): ErrorWord[] {
	const { quizType, currentSection, currentSentence, userWords, sectionInd } =
		params
	const errorWords: ErrorWord[] = []

	const addWordIfMissing = (
		w: WordObject,
		idx: number,
		sect: SentenceDataEntry
	) => {
		if (!userWords.includes(sanitize(w.word))) {
			errorWords.push({
				word: w,
				sectionInd: idx,
				phrase:
					"phraseTranslation" in sect ? sect.phraseTranslation : undefined,
				currentSection: sect,
			})
		}
	}

	if (quizType === "parts") {
		if ("translation" in currentSection && currentSection.translation != null) {
			const t = currentSection.translation
			if (Array.isArray(t)) {
				t.forEach((w) => addWordIfMissing(w, sectionInd, currentSection))
			} else if (typeof t !== "string") {
				addWordIfMissing(t, sectionInd, currentSection)
			}
		}
	} else {
		currentSentence.data.forEach((sect, idx) => {
			if (!("translation" in sect) || sect.translation == null) return
			const t = sect.translation
			if (Array.isArray(t)) {
				t.forEach((w) => addWordIfMissing(w, idx, sect))
			} else if (typeof t !== "string") {
				addWordIfMissing(t, idx, sect)
			}
		})
	}

	return errorWords
}

function findErrorRefsHelper(params: {
	quizType: QuizType
	currentSection: SentenceDataEntry
	currentSentence: Sentence
	errorWords: ErrorWord[]
	sectionInd: number
}): string[] {
	const { quizType, currentSection, currentSentence, errorWords, sectionInd } =
		params
	const tempRefs: string[] = []

	const pushRefsFrom = (word: WordObject, fromSection: SentenceDataEntry) => {
		if (!("reference" in fromSection) || !fromSection.reference) return
		const arr = fromSection.reference[word.id]
		if (!arr) return
		arr.forEach((idxOrKey) => {
			const info = word.info
			if (!info) return
			if (typeof idxOrKey === "number") {
				const ref = info[idxOrKey]
				if (ref && !tempRefs.includes(ref)) tempRefs.push(ref)
			} else {
				const maybeNum = Number(idxOrKey)
				if (
					Number.isInteger(maybeNum) &&
					info[maybeNum] &&
					!tempRefs.includes(info[maybeNum])
				) {
					tempRefs.push(info[maybeNum])
				} else if (!tempRefs.includes(idxOrKey)) {
					tempRefs.push(idxOrKey)
				}
			}
		})
	}

	if (quizType === "parts") {
		if ("reference" in currentSection && currentSection.reference) {
			errorWords.forEach((err) => {
				if (err.sectionInd === sectionInd) {
					pushRefsFrom(err.word, currentSection)
				}
			})
		}
	} else {
		errorWords.forEach((err) => {
			currentSentence.data.forEach((sect) => {
				pushRefsFrom(err.word, sect)
			})
		})
	}
	return tempRefs
}

interface QuizState {
	// Config
	quizType: QuizType
	feedbackMode: boolean

	// Session
	lessonNumber: number
	randomizedSentences: Sentence[]
	sentenceIndex: number
	currentSections: CurrentSectionEntry[]
	sectionIndex: number | null

	// User progress
	translatedWords: TranslatedWordEntry[]
	lessonLog: SubmissionLog[]
	errors: ErrorEntry[]

	// UI
	showFeedbackModal: boolean
	showScoreModal: boolean
	userInput: string

	// Actions
	startQuiz: (lesson: Lesson, quizType?: QuizType) => void
	setQuizType: (mode: QuizType) => void
	setUserInput: (val: string) => void
	handleUserSubmit: (input?: string) => void
	closeFeedbackModal: () => void
	closeScoreModal: () => void

	// Helpers
	getNextSection: (
		sentenceIdx?: number,
		translated?: TranslatedWordEntry[]
	) => number | null
	getNextSentence: (nextIndex?: number) => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
	// Defaults
	quizType: "parts",
	feedbackMode: true,

	lessonNumber: 1,
	randomizedSentences: [],
	sentenceIndex: 0,
	currentSections: [],
	sectionIndex: 0,

	translatedWords: [],
	lessonLog: [],
	errors: [],

	showFeedbackModal: false,
	showScoreModal: false,
	userInput: "",

	startQuiz: (lesson: Lesson, quizType?: QuizType) => {
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

	setQuizType: (mode: QuizType) => {
		const state = get()
		const currentSentence = state.randomizedSentences[state.sentenceIndex]
		const currentSections = getCurrentSectionsForSentence(currentSentence)

		let nextSection: number | null = null
		if (mode === "parts") {
			nextSection = get().getNextSection(state.sentenceIndex, [])
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

	setUserInput: (val: string) => {
		console.log("setUserInput", val)
		set({ userInput: val })
	},

	handleUserSubmit: (input?: string) => {
		console.log("handleUserSubmit", input)
		const state = get()
		console.log("Current state:", state)
		const sentence = state.randomizedSentences[state.sentenceIndex]
		if (!sentence) {
			console.warn("No current sentence found.")
			return
		}
		const sectionIdx = state.sectionIndex
		console.log("Current section index:", sectionIdx)
		if (sectionIdx === null || sectionIdx === undefined) return
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
			console.log("Answer is correct")
			// if (state.feedbackMode) {
			// 	console.log("Showing feedback modal")
			// 	set({ showFeedbackModal: true })
			// 	return
			// }

			// Update translated words (parts mode only)
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

			const nextSection = get().getNextSection(
				state.sentenceIndex,
				updatedTranslated
			)
			console.log(state.quizType, nextSection)
			if (state.quizType === "parts" && nextSection !== null) {
				console.log("Next section:", nextSection)
				set({
					sectionIndex: nextSection,
					translatedWords: updatedTranslated,
					userInput: "",
				})
				return
			}

			// Move to next sentence if done with sections or in full mode
			set({ translatedWords: updatedTranslated, userInput: "" })
			get().getNextSentence(state.sentenceIndex + 1)
		} else {
			const errorWords = findErrorsHelper({
				quizType: state.quizType,
				currentSection,
				currentSentence: sentence,
				userWords: provided.split(" ").map((w) => sanitize(w)),
				sectionInd: sectionIdx,
			})

			const references = findErrorRefsHelper({
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
		}
	},

	closeFeedbackModal: () => set({ showFeedbackModal: false }),
	closeScoreModal: () => set({ showScoreModal: false }),

	getNextSection: (
		sentenceIdx?: number,
		translated?: TranslatedWordEntry[]
	) => {
		console.log("getNextSection", sentenceIdx, translated)
		const state = get()
		const sIdx = sentenceIdx ?? state.sentenceIndex
		const sentence = state.randomizedSentences[sIdx]
		if (!sentence) return null

		const taken = new Set(
			(translated ?? state.translatedWords).map((t) => t.index)
		)
		const nextIndex = sentence.data.findIndex((section, idx) => {
			const hasTranslation =
				"translation" in section &&
				section.translation !== undefined &&
				section.translation !== null
			const isNotYetTranslated = !taken.has(idx)
			return hasTranslation && isNotYetTranslated
		})
		return nextIndex === -1 ? null : nextIndex
	},

	getNextSentence: (nextIndex?: number) => {
		console.log("getNextSentence", nextIndex)
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
}))
