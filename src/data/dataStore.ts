// Proxy to centralized app store for backward compatibility.
import { useAppStore } from "./appStore"
export const useDataStore = useAppStore

// import { create } from "zustand"
// import type { Lesson, Sentence } from "../types/types"
// import spanishData from "./spanishData"

// function clamp(n: number, min: number, max: number) {
// 	return Math.max(min, Math.min(max, n))
// }

// interface DataState {
// 	// Data
// 	lessons: Lesson[]

// 	// Indices (single source of truth for position)
// 	currentLessonIndex: number
// 	currentSentenceIndex: number // -1 when none

// 	// Derived/selected objects
// 	currentLesson: Lesson | null
// 	currentSentence: Sentence | null

// 	// High-level actions (preferred)
// 	setLessonIndex: (index: number) => void
// 	setSentenceIndex: (index: number) => void
// 	nextLesson: () => void
// 	prevLesson: () => void
// 	nextSentence: () => void
// 	prevSentence: () => void

// 	// Backwards-compatible actions (delegate to index-based)
// 	setCurrentLesson: (lesson: Lesson) => void
// 	setCurrentSentence: (sentence: Sentence) => void
// }

// const lessons = spanishData.lessons

// const initialLessonIndex = clamp(2, 0, Math.max(0, lessons.length - 1))
// const initialLesson = lessons[initialLessonIndex] ?? null
// const initialSentenceIndex = initialLesson?.sentences?.length ? 0 : -1
// const initialSentence =
// 	initialSentenceIndex >= 0
// 		? initialLesson!.sentences![initialSentenceIndex]
// 		: null

// export const useDataStore = create<DataState>((set, get) => ({
// 	lessons,

// 	currentLessonIndex: initialLessonIndex,
// 	currentSentenceIndex: initialSentenceIndex,

// 	currentLesson: initialLesson,
// 	currentSentence: initialSentence,

// 	setLessonIndex: (index: number) => {
// 		const idx = clamp(index, 0, lessons.length - 1)
// 		const lesson = lessons[idx] ?? null

// 		const firstSentenceIndex = lesson?.sentences?.length ? 0 : -1
// 		const sentence =
// 			firstSentenceIndex >= 0 ? lesson!.sentences![firstSentenceIndex] : null

// 		set({
// 			currentLessonIndex: idx,
// 			currentLesson: lesson,
// 			currentSentenceIndex: firstSentenceIndex,
// 			currentSentence: sentence,
// 		})
// 	},

// 	setSentenceIndex: (index: number) => {
// 		const lesson = get().currentLesson
// 		if (!lesson?.sentences?.length) return
// 		const idx = clamp(index, 0, lesson.sentences.length - 1)
// 		set({
// 			currentSentenceIndex: idx,
// 			currentSentence: lesson.sentences[idx],
// 		})
// 	},

// 	nextLesson: () => {
// 		const idx = get().currentLessonIndex
// 		if (idx < lessons.length - 1) get().setLessonIndex(idx + 1)
// 	},

// 	prevLesson: () => {
// 		const idx = get().currentLessonIndex
// 		if (idx > 0) get().setLessonIndex(idx - 1)
// 	},

// 	nextSentence: () => {
// 		const curIdx = get().currentSentenceIndex
// 		const lesson = get().currentLesson
// 		if (!lesson?.sentences?.length) return
// 		if (curIdx < lesson.sentences.length - 1) {
// 			get().setSentenceIndex(curIdx + 1)
// 		}
// 	},

// 	prevSentence: () => {
// 		const curIdx = get().currentSentenceIndex
// 		if (curIdx > 0) {
// 			get().setSentenceIndex(curIdx - 1)
// 		}
// 	},

// 	// Backwards-compatible setters
// 	setCurrentLesson: (lesson: Lesson) => {
// 		const idx = lessons.findIndex((l) => l.lesson === lesson.lesson)
// 		if (idx >= 0) get().setLessonIndex(idx)
// 	},

// 	setCurrentSentence: (sentence: Sentence) => {
// 		const lesson = get().currentLesson
// 		if (!lesson?.sentences) return
// 		const idx = lesson.sentences.findIndex((s) => s.id === sentence.id)
// 		if (idx >= 0) get().setSentenceIndex(idx)
// 	},
// }))
