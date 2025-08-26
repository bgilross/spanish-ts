"use client"
import { useQuizStore } from "@/data/quizStore"
import { KeyboardEvent } from "react"

export default function QuizInput() {
	const userInput = useQuizStore((s) => s.userInput)
	const setUserInput = useQuizStore((s) => s.setUserInput)
	const handleUserSubmit = useQuizStore((s) => s.handleUserSubmit)

	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault()
			handleUserSubmit()
		}
	}

	return (
		<input
			className="border rounded px-3 py-2 w-full"
			value={userInput}
			onChange={(e) => setUserInput(e.target.value)}
			onKeyDown={onKeyDown}
			placeholder="Type your answer and press Enter"
		/>
	)
}
