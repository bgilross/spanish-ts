"use client"

// import { useSelector, useDispatch } from "react-redux"
// import type { RootState, AppDispatch } from "@/data/store"
// import { setLesson, setSentence } from "@/data/dataSlice"
// import spanishData from "../data/spanishData" // adjust import path as needed

const Header = () => {
	// const dispatch: AppDispatch = useDispatch()

	// const lessonIndex = useSelector(
	// 	(state: RootState) => state.data.currentLessonIndex
	// )
	// const sentenceIndex = useSelector(
	// 	(state: RootState) => state.data.currentSentenceIndex
	// )

	// const lessons = Object.values(spanishData)
	// const currentLesson = lessons[lessonIndex]

	return (
		<header className="bg-primary text-secondary shadow-2xl shadow-primary rounded-b-xl h-16 px-6 flex items-center justify-between z-10 w-full">
			<div className="text-2xl font-bold">SpanishTester</div>
			<div className="flex gap-4 items-center">
				{/* <select
					value={lessonIndex}
					onChange={(e) => dispatch(setLesson(Number(e.target.value)))}
					className="bg-secondary text-primary p-1 rounded"
				>
					{lessons.map((lesson, i) => (
						<option
							key={i}
							value={i}
						>
							Lesson {lesson.lesson}
						</option>
					))}
				</select> */}

				{/* <select
					value={sentenceIndex}
					onChange={(e) => dispatch(setSentence(Number(e.target.value)))}
					className="bg-secondary text-primary p-1 rounded"
				>
					{currentLesson?.sentences?.map((_, i) => (
						<option
							key={i}
							value={i}
						>
							Sentence {i + 1}
						</option>
					))}
				</select> */}
			</div>
		</header>
	)
}

export default Header
