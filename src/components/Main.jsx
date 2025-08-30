"use client"

// import Sentence from "./Sentence"
import QuizInput from "./QuizInput"
import QuizInitializer from "./QuizInitializer"
import dynamic from "next/dynamic"

// Render Sentence only on the client to avoid SSR hydration mismatch
const Sentence = dynamic(() => import("./Sentence"), {
	ssr: false,
	loading: () => <div className="text-6xl text-spanishBlue">Loading…</div>,
})

const DebugPanel = dynamic(() => import("./DebugPanel"), {
	ssr: false,
})

const Main = () => {
	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-4 text-center">
			<QuizInitializer />
			<Sentence />
			<div className="w-full max-w-3xl">
				<QuizInput />
			</div>
			<div className="w-full max-w-3xl">
				<DebugPanel />
			</div>
		</div>
	)
}

export default Main
