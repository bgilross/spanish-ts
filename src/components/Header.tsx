"use client"

import { useDataStore } from "@/data/dataStore"
import { useUIStore } from "@/data/uiStore"
import QuizModeSwitcher from "./QuizModeSwitcher"

const Header = () => {
	const lessons = useDataStore((s) => s.lessons)

	const currentLesson = useDataStore((s) => s.currentLesson)
	const currentLessonIndex = useDataStore((s) => s.currentLessonIndex)
	const currentSentenceIndex = useDataStore((s) => s.currentSentenceIndex)

	const setLessonIndex = useDataStore((s) => s.setLessonIndex)
	const setSentenceIndex = useDataStore((s) => s.setSentenceIndex)

	const openLessonInfoModal = useUIStore((s) => s.openLessonInfoModal)

	const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const index = parseInt(e.target.value, 10)
		setLessonIndex(index)
	}

	const handleSentenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const index = parseInt(e.target.value, 10)
		setSentenceIndex(index)
	}

	return (
		<header className="w-full p-4 bg-gray-100 border-b flex justify-center">
			<div className="flex items-center gap-4">
				<QuizModeSwitcher />
				<select
					value={currentLessonIndex}
					onChange={handleLessonChange}
					className="px-2 py-1 border rounded"
				>
					{lessons.map((lesson, i) => (
						<option
							key={i}
							value={i}
						>
							Lesson {lesson.lesson} - {lesson.details}
						</option>
					))}
				</select>

				<select
					value={currentSentenceIndex >= 0 ? currentSentenceIndex : 0}
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

				<button
					className="bg-blue-600 text-white px-4 py-1 rounded"
					onClick={openLessonInfoModal}
				>
					View Lesson Info
				</button>
			</div>
		</header>
	)
}

export default Header
