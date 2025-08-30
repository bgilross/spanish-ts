"use client"

import { useMemo } from "react"
import { useQuizStore } from "@/data/quizStore"
import { useDataStore } from "@/data/dataStore"
import type {
	Sentence,
	SentenceDataEntry,
	CurrentSectionEntry,
	WordObject,
} from "@/types/types"

function uniq<T>(arr: T[]): T[] {
	return Array.from(new Set(arr))
}

function asArray<T>(val: T | T[] | null | undefined): T[] {
	if (val == null) return []
	return Array.isArray(val) ? val : [val]
}

function extractAcceptableAnswers(
	section: SentenceDataEntry | undefined,
	sentence: Sentence | undefined,
	quizType: "parts" | "full"
): string[] {
	if (!section || !sentence) return []
	if (quizType === "parts") {
		// Prefer phraseTranslation if present
		const phrase: string[] = (() => {
			if (!("phraseTranslation" in section)) return []
			const p = section.phraseTranslation
			if (typeof p === "string") return [p]
			if (Array.isArray(p)) return p.filter(Boolean) as string[]
			return []
		})()

		// Then fall back to translation
		const translation: string[] = (() => {
			if (!("translation" in section) || section.translation == null) return []
			const t = section.translation
			if (typeof t === "string") return [t]
			if (Array.isArray(t)) return [t.map((w) => w.word).join(" ")]
			return [t.word]
		})()

		return uniq([...phrase, ...translation]).filter(Boolean)
	}
	// Full sentence mode
	return sentence.translation ? [sentence.translation] : []
}

function getTakenAndRemainingSectionIndices(
	currentSections: CurrentSectionEntry[],
	translatedIndices: number[]
) {
	const taken = new Set(translatedIndices)
	const all = currentSections.map((c) => c.index)
	const remaining = all.filter((i) => !taken.has(i))
	return { taken: Array.from(taken).sort((a, b) => a - b), remaining }
}

export default function DebugPanel() {
	// Data store (for reference)
	const currentLesson = useDataStore((s) => s.currentLesson)
	const currentLessonIndex = useDataStore((s) => s.currentLessonIndex)
	const currentSentenceIndexNav = useDataStore((s) => s.currentSentenceIndex)

	// Quiz store
	const quizType = useQuizStore((s) => s.quizType)
	const lessonNumber = useQuizStore((s) => s.lessonNumber)
	const randomizedSentences = useQuizStore((s) => s.randomizedSentences)
	const sentenceIndex = useQuizStore((s) => s.sentenceIndex)
	const currentSections = useQuizStore((s) => s.currentSections)
	const sectionIndex = useQuizStore((s) => s.sectionIndex)
	const translatedWords = useQuizStore((s) => s.translatedWords)
	const userInput = useQuizStore((s) => s.userInput)
	const errors = useQuizStore((s) => s.errors)
	const getNextSection = useQuizStore((s) => s.getNextSection)
	const getNextSentence = useQuizStore((s) => s.getNextSentence)
	const handleUserSubmit = useQuizStore((s) => s.handleUserSubmit)

	const sentence: Sentence | undefined = randomizedSentences[sentenceIndex]
	const section: SentenceDataEntry | undefined =
		sectionIndex != null ? currentSections[sectionIndex]?.section : undefined

	const acceptableAnswers = useMemo(
		() => extractAcceptableAnswers(section, sentence, quizType),
		[section, sentence, quizType]
	)

	const translatedIndices = translatedWords.map((t) => t.index)
	const { taken, remaining } = getTakenAndRemainingSectionIndices(
		currentSections,
		translatedIndices
	)

	const nextSectionPreview = getNextSection()
	const nextSentenceIndex =
		sentenceIndex + 1 < randomizedSentences.length ? sentenceIndex + 1 : null

	const lastError = errors[errors.length - 1]

	const submitCorrect = () => {
		const candidate =
			acceptableAnswers[0] ??
			(quizType === "full" ? sentence?.translation ?? "" : "")
		handleUserSubmit(candidate)
	}

	return (
		<details
			className="w-full max-w-3xl border rounded-md bg-gray-50 text-left"
			open
		>
			<summary className="cursor-pointer px-3 py-2 font-medium text-gray-700">
				Debug Panel
			</summary>

			<div className="p-3 space-y-3">
				<div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500">Lesson (nav / quiz)</div>
						<div className="font-mono">
							{currentLessonIndex} / {lessonNumber}
						</div>
					</div>
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500">Quiz Mode</div>
						<div className="font-mono">{quizType}</div>
					</div>
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500">Sentence (nav / quiz)</div>
						<div className="font-mono">
							{currentSentenceIndexNav} / {sentenceIndex} of{" "}
							{randomizedSentences.length}
						</div>
					</div>
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500">Section</div>
						<div className="font-mono">
							{sectionIndex ?? "null"} of {currentSections.length}
						</div>
					</div>
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500">Next Section Preview</div>
						<div className="font-mono">{nextSectionPreview ?? "null"}</div>
					</div>
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500">Next Sentence Index</div>
						<div className="font-mono">{nextSentenceIndex ?? "end"}</div>
					</div>
					<div className="p-2 bg-white rounded border col-span-2 md:col-span-3">
						<div className="text-gray-500">
							Translated Sections (taken) / Remaining
						</div>
						<div className="font-mono break-words">
							taken: [{taken.join(", ")}] | remaining: [{remaining.join(", ")}]
						</div>
					</div>
					<div className="p-2 bg-white rounded border col-span-2 md:col-span-3">
						<div className="text-gray-500">User Input</div>
						<div className="font-mono break-words">
							{userInput || "(empty)"}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
						onClick={submitCorrect}
						disabled={
							!acceptableAnswers.length && quizType === "parts" && !section
						}
						title="Submits a correct answer based on the current mode/section to advance"
					>
						Submit Correct Answer
					</button>
					<button
						className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
						onClick={() => getNextSentence()}
						title="Advance to next sentence (skips remaining sections)"
					>
						Next Sentence
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500 mb-1">Acceptable Answer(s)</div>
						<pre className="text-xs overflow-auto">
							{JSON.stringify(acceptableAnswers, null, 2)}
						</pre>
					</div>
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500 mb-1">Current Sentence (raw)</div>
						<pre className="text-xs overflow-auto">
							{JSON.stringify(sentence ?? null, null, 2)}
						</pre>
					</div>
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500 mb-1">Current Section (raw)</div>
						<pre className="text-xs overflow-auto">
							{JSON.stringify(section ?? null, null, 2)}
						</pre>
					</div>
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500 mb-1">TranslatedWords (raw)</div>
						<pre className="text-xs overflow-auto">
							{JSON.stringify(translatedWords, null, 2)}
						</pre>
					</div>
					<div className="p-2 bg-white rounded border">
						<div className="text-gray-500 mb-1">Last Error (raw)</div>
						<pre className="text-xs overflow-auto">
							{JSON.stringify(lastError ?? null, null, 2)}
						</pre>
					</div>
				</div>
			</div>
		</details>
	)
}
