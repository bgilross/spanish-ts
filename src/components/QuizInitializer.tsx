"use client"

import { useEffect, useRef } from "react"
import { useQuizStore } from "@/data/quizStore"
import { useDataStore } from "@/data/dataStore"

export default function QuizInitializer() {
	// From your navigation/data store
	const currentLesson = useDataStore((s) => s.currentLesson)
	const selectedSentenceIndex = useDataStore((s) => s.currentSentenceIndex)

	// From the quiz store
	const startQuiz = useQuizStore((s) => s.startQuiz)
	const getNextSentence = useQuizStore((s) => s.getNextSentence)
	const quizLessonNumber = useQuizStore((s) => s.lessonNumber)
	const randomizedSentences = useQuizStore((s) => s.randomizedSentences)
	const randomizedLen = useQuizStore((s) => s.randomizedSentences.length)

	// 1) Initialize quiz when lesson loads or changes
	useEffect(() => {
		if (!currentLesson) return
		if (randomizedLen === 0 || quizLessonNumber !== currentLesson.lesson) {
			startQuiz(currentLesson) // keep current quizType
		}
	}, [currentLesson, quizLessonNumber, randomizedLen, startQuiz])

	// 2) Sync quiz sentence to header selection ONLY when the header selection changes.
	//    Map header's lesson-order index to the randomized index using sentence id.
	const lastSelectedRef = useRef<number | null>(null)
	useEffect(() => {
		if (randomizedLen === 0) return
		if (typeof selectedSentenceIndex !== "number" || selectedSentenceIndex < 0)
			return

		// Only run when the user actually changes the header selection
		if (lastSelectedRef.current === selectedSentenceIndex) return
		lastSelectedRef.current = selectedSentenceIndex

		const targetId = currentLesson?.sentences?.[selectedSentenceIndex]?.id
		if (targetId == null) return

		const randIdx = randomizedSentences.findIndex((s) => s.id === targetId)
		if (randIdx >= 0) {
			getNextSentence(randIdx)
		}
	}, [
		selectedSentenceIndex,
		randomizedLen,
		randomizedSentences,
		currentLesson,
		getNextSentence,
	])

	return null
}
