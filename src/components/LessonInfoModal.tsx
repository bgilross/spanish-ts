"use client"

import { useUIStore } from "@/data/uiStore"
import { useDataStore } from "@/data/dataStore"

const LessonInfoModal = () => {
	const show = useUIStore((s) => s.showLessonInfoModal)
	const close = useUIStore((s) => s.closeLessonInfoModal)
	const currentLesson = useDataStore((s) => s.currentLesson)

	if (!show || !currentLesson) return null

	return (
		<div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
			<div className="bg-white rounded shadow-lg max-w-xl w-full max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="p-4 border-b">
					<h2 className="text-2xl font-semibold">
						Lesson {currentLesson.lesson}: {currentLesson.name}
					</h2>
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
				<div className="border-t p-4">
					<button
						onClick={close}
						className="bg-red-600 text-white px-4 py-1 rounded w-full"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}

export default LessonInfoModal
