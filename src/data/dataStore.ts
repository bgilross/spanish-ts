import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Lesson, Sentence } from "../types/types"

interface DataState {
	currentLesson: Lesson | null
	currentSentence: Sentence | null

	// Actions
	setCurrentLesson: (lesson: Lesson) => void
	setCurrentSentence: (sentence: Sentence) => void
}

export const useDataStore = create<DataState>()(
	persist(
		(set) => ({
			currentLesson: null,
			currentSentence: null,

			setCurrentLesson: (lesson) =>
				set({
					currentLesson: lesson,
					currentSentence: lesson.sentences?.[0] || null,
				}),

			setCurrentSentence: (sentence) => set({ currentSentence: sentence }),
		}),
		{
			name: "language-app-data",
			// Only persist specific values if needed
			// partialize: (state) => ({
			// 	userProgress: state.userProgress,
			// }),
		}
	)
)
