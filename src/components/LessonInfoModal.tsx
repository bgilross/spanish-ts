"use client"

import { useUIStore } from "@/data/uiStore"
import { useDataStore } from "@/data/dataStore"
import spanishData from "@/data/spanishData"

const LessonInfoModal = () => {
	const show = useUIStore((s) => s.showLessonInfoModal)
	const close = useUIStore((s) => s.closeLessonInfoModal)

	const currentLesson = useDataStore((s) => s.currentLesson)
	const setLesson = useDataStore((s) => s.setCurrentLesson)
	const setSentence = useDataStore((s) => s.setCurrentSentence)

	if (!show || !currentLesson) return null

	const currentIndex = spanishData.lessons.findIndex(
		(l) => l.lesson === currentLesson.lesson
	)
	const hasPrev = currentIndex > 0
	const hasNext = currentIndex < spanishData.lessons.length - 1

	const goToLesson = (index: number) => {
		const lesson = spanishData.lessons[index]
		if (!lesson) return
		setLesson(lesson)
		// Set the first sentence if present. If not, leave the prior sentence as-is.
		if (lesson.sentences?.[0]) {
			setSentence(lesson.sentences[0])
		}
		// Keep the modal open (do not call close()).
	}

	const onPrev = () => {
		if (hasPrev) goToLesson(currentIndex - 1)
	}

	const onNext = () => {
		if (hasNext) goToLesson(currentIndex + 1)
	}

	return (
		<div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
			<div className="bg-white rounded shadow-lg max-w-xl w-full max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="p-4 border-b">
					<h2 className="text-2xl font-semibold">
						Lesson {currentLesson.lesson}: {currentLesson.name}
					</h2>
					<p className="text-gray-600">{currentLesson.details}</p>
				</div>

				{/* Scrollable content */}
				<div className="overflow-auto p-4 flex-1">
					<ul className="list-disc pl-5 space-y-2 text-lg">
						{currentLesson.info.map((line, i) => (
							<li key={i}>{line}</li>
						))}
					</ul>
				</div>

				{/* Sticky footer */}
				<div className="border-t p-4 flex flex-wrap gap-2 justify-between">
					<button
						onClick={onPrev}
						className="bg-gray-200 text-gray-800 px-4 py-1 rounded disabled:opacity-50"
						disabled={!hasPrev}
					>
						Previous Lesson
					</button>
					<div className="flex gap-2 ml-auto">
						<button
							onClick={onNext}
							className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
							disabled={!hasNext}
						>
							Next Lesson
						</button>
						<button
							onClick={close}
							className="bg-red-600 text-white px-4 py-1 rounded"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LessonInfoModal
