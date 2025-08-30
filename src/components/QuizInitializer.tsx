"use client"

import { useEffect } from "react"
import { useDataStore } from "@/data/dataStore"
import { useQuizStore } from "@/data/quizStore"

export default function QuizInitializer() {
	// From your navigation/data store
	const currentLesson = useDataStore((s) => s.currentLesson)
	const selectedSentenceIndex = useDataStore((s) => s.currentSentenceIndex)

	// From the quiz store
	const startQuiz = useQuizStore((s) => s.startQuiz)
	const getNextSentence = useQuizStore((s) => s.getNextSentence)
	const quizLessonNumber = useQuizStore((s) => s.lessonNumber)
	const quizSentenceIndex = useQuizStore((s) => s.sentenceIndex)
	const randomizedLen = useQuizStore((s) => s.randomizedSentences.length)

	// Initialize quiz when lesson loads or changes
	useEffect(() => {
		if (!currentLesson) return
		if (randomizedLen === 0 || quizLessonNumber !== currentLesson.lesson) {
			startQuiz(currentLesson) // keep current quizType
		}
	}, [currentLesson, quizLessonNumber, randomizedLen, startQuiz])

	// Keep quiz sentence in sync with the selector in the header
	useEffect(() => {
		if (randomizedLen === 0) return
		if (
			typeof selectedSentenceIndex === "number" &&
			selectedSentenceIndex >= 0 &&
			selectedSentenceIndex !== quizSentenceIndex
		) {
			getNextSentence(selectedSentenceIndex)
		}
	}, [selectedSentenceIndex, randomizedLen, quizSentenceIndex, getNextSentence])

	return null
}
