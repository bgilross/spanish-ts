"use client"

import { useDataStore } from "@/data/dataStore"
import spanishData from "@/data/spanishData"

const Header = () => {
	const currentLesson = useDataStore((s) => s.currentLesson)
	const setLesson = useDataStore((s) => s.setCurrentLesson)
	const currentSentence = useDataStore((s) => s.currentSentence)
	const setSentence = useDataStore((s) => s.setCurrentSentence)

	const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const index = parseInt(e.target.value, 10)
		const lesson = spanishData.lessons[index]
		setLesson(lesson)
		if (lesson.sentences?.[0]) setSentence(lesson.sentences[0])
	}

	const handleSentenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const index = parseInt(e.target.value, 10) //coerce string to int. dropdowns are always string?
		if (currentLesson?.sentences?.[index]) {
			setSentence(currentLesson.sentences[index])
		} else {
			console.log("No sentence # " + index + " found for this lesson.")
		}
	}

	return (
		<header className="w-full p-4 bg-gray-100 border-b flex justify-center">
			<div className="flex items-center gap-4">
				<select
					value={
						currentLesson
							? spanishData.lessons.findIndex(
									(l) => l.lesson === currentLesson.lesson
							  )
							: 0
					}
					onChange={handleLessonChange}
					className="px-2 py-1 border rounded"
				>
					{spanishData.lessons.map((lesson, i) => (
						<option
							key={i}
							value={i}
						>
							Lesson {lesson.lesson} - {lesson.name}
						</option>
					))}
				</select>

				<select
					value={
						currentLesson?.sentences?.findIndex(
							(s) => s.id === currentSentence?.id
						) ?? 0
					}
					onChange={handleSentenceChange}
					className="px-2 py-1 border rounded"
					disabled={!currentLesson?.sentences?.length}
				>
					{currentLesson?.sentences?.map((_, i) => (
						<option
							key={i}
							value={i}
						>
							Sentence {i + 1}
						</option>
					))}
				</select>
			</div>
		</header>
	)
}

export default Header
