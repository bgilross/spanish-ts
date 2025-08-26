"use client"

import { useQuizStore } from "@/data/quizStore"
import type { QuizType } from "@/types/types"

export default function QuizModeSwitcher() {
	const quizType = useQuizStore((s) => s.quizType)
	const setQuizType = useQuizStore((s) => s.setQuizType)

	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setQuizType(e.target.value as QuizType)
	}

	return (
		<div className="flex items-center gap-2">
			<label className="text-sm text-gray-600">Mode:</label>
			<select
				className="px-2 py-1 border rounded"
				value={quizType}
				onChange={onChange}
			>
				<option value="parts">Parts</option>
				<option value="full">Full</option>
			</select>
		</div>
	)
}
