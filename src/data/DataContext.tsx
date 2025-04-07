import { createContext, useContext, useState } from "react"
import spanishData from "@/data/spanishData"
import { Lesson, Sentence } from "@/types/types"

interface DataContextType {
	currentLesson: Lesson | null
	currentSentence: Sentence | null
	setCurrentLessonIndex: React.Dispatch<React.SetStateAction<number | null>>
	setCurrentSentenceIndex: React.Dispatch<React.SetStateAction<number | null>>
}

const DataContext = createContext<DataContextType | null>(null)

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
	const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(0)
	const [currentSentenceIndex, setCurrentSentenceIndex] = useState<
		number | null
	>(0)

	const lessonList: Lesson[] = Object.values(spanishData.lessons)
	const currentLesson =
		currentLessonIndex !== null ? lessonList[currentLessonIndex] : null
	const currentSentence =
		currentLesson && currentSentenceIndex !== null
			? currentLesson.sentences[currentSentenceIndex]
			: null

	return (
		<DataContext.Provider
			value={{
				currentLesson,
				currentSentence,
				setCurrentLessonIndex,
				setCurrentSentenceIndex,
			}}
		>
			{children}
		</DataContext.Provider>
	)
}

export const useDataContext = () => {
	const context = useContext(DataContext)
	if (!context) {
		throw new Error("useDataContext must be used within a DataProvider")
	}
	return context
}
