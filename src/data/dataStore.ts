import { create } from "zustand"
import type { Lesson, Sentence } from "../types/types"
import spanishData from "./spanishData"

interface DataState {
	currentLesson: Lesson | null
	currentSentence: Sentence | null

	// Actions
	setCurrentLesson: (lesson: Lesson) => void
	setCurrentSentence: (sentence: Sentence) => void
}

export const useDataStore = create<DataState>((set) => ({
	currentLesson: spanishData.lessons[2],
	currentSentence: spanishData.lessons[2]?.sentences?.[0] || null,

	setCurrentLesson: (lesson: Lesson) => set({ currentLesson: lesson }),
	setCurrentSentence: (sentence: Sentence) =>
		set({ currentSentence: sentence }),
}))
