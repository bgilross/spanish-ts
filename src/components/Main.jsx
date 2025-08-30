"use client"

import Sentence from "./Sentence"
import QuizInput from "./QuizInput"
import QuizInitializer from "./QuizInitializer"

const Main = () => {
	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-4 text-center">
			<QuizInitializer />
			<Sentence />
			<div className="w-full max-w-3xl">
				<QuizInput />
			</div>
		</div>
	)
}

export default Main
