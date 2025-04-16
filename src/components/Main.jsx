"use client"

import { useDataStore } from "@/data/dataStore"

const Main = () => {
	const currentLesson = useDataStore((state) => state.currentLesson)
	const currentSentence = useDataStore((state) => state.currentSentence)

	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-2xl font-semibold">
				{currentLesson ? currentLesson.name : "No Lesson Loaded"}
			</h1>
			<button onClick={() => console.log(currentLesson)}>CHECK</button>
			<p className="text-lg">
				{currentSentence ? currentSentence.translation : "No Sentence Selected"}
			</p>
		</div>
	)
}

export default Main
