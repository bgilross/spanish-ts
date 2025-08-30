"use client"

import { useEffect, useMemo } from "react"
import { useQuizStore } from "@/data/quizStore"
import type { SentenceDataEntry, WordObject } from "@/types/types"

function nonBreakingSpaces(n: number) {
	return "\u00A0".repeat(n)
}

function isSectionTranslatable(s: SentenceDataEntry): boolean {
	return (
		"translation" in s && s.translation !== undefined && s.translation !== null
	)
}

export default function Sentence() {
	// IMPORTANT: select each field separately (avoid returning a new object every render)
	const quizType = useQuizStore((s) => s.quizType)
	const randomizedSentences = useQuizStore((s) => s.randomizedSentences)
	const sentenceIndex = useQuizStore((s) => s.sentenceIndex)
	const currentSections = useQuizStore((s) => s.currentSections)
	const sectionIndex = useQuizStore((s) => s.sectionIndex)
	const translatedWords = useQuizStore((s) => s.translatedWords)
	const userInput = useQuizStore((s) => s.userInput)

	const currentSentence = randomizedSentences?.[sentenceIndex]
	const currentSectionEntry =
		sectionIndex !== null && sectionIndex !== undefined
			? currentSections?.[sectionIndex]
			: undefined

	const wordsInSection = useMemo(() => {
		const section = currentSectionEntry?.section
		if (!section || !("translation" in section)) return 0
		const t = section.translation
		if (Array.isArray(t)) {
			return t.filter((w) => (w as WordObject).word).length
		}
		if (t && typeof t === "object" && "word" in t) {
			return 1
		}
		if (typeof t === "string") {
			return t.trim().length > 0 ? 1 : 0
		}
		return 0
	}, [currentSectionEntry])

	const isTranslated = (index: number) => {
		return translatedWords.some((entry) => entry.index === index)
	}

	const untranslatedSentence = useMemo(() => {
		if (!currentSentence) return null

		if (quizType === "parts") {
			const sentenceParts = currentSentence.data
			if (sentenceParts) {
				const highlightedIndex =
					currentSections?.[sectionIndex ?? 0]?.index ?? -1
				return sentenceParts.map((item, index) => (
					<span
						key={index}
						className={[
							"mr-2",
							isSectionTranslatable(item) ? "text-accent font-bold" : "",
							index === highlightedIndex ? "border-4 border-accent" : "",
							isTranslated(index) ? "text-green-700 text-6xl" : "",
						]
							.filter(Boolean)
							.join(" ")}
					>
						{item.phrase}
					</span>
				))
			}
		}

		if (quizType === "full") {
			return currentSentence.sentence
		}

		return null
	}, [
		currentSentence,
		quizType,
		currentSections,
		sectionIndex,
		translatedWords,
	])

	const translatedSentence = useMemo(() => {
		if (!currentSentence) return null

		if (quizType === "full") {
			return (
				<div className="mb-4 border-b-4 border-secondary w-full h-8 relative flex justify-center items-center">
					<span
						className="text-black text-5xl absolute inset-0 flex justify-center items-center"
						style={{ whiteSpace: "pre-wrap", transform: "translateY(-10px)" }}
					>
						{userInput}
					</span>
					<span className="invisible">
						{nonBreakingSpaces((currentSentence?.sentence?.length ?? 20) + 12)}
					</span>
				</div>
			)
		}

		// For "parts", render each section dynamically
		const currentSectionIndex =
			currentSections?.[sectionIndex ?? 0]?.index ?? -1

		return currentSentence.data?.map((sect, index) => {
			const hasTranslation = isSectionTranslatable(sect)
			const beforeCurrent = index < currentSectionIndex
			const atCurrent = index === currentSectionIndex
			const afterCurrent = index > currentSectionIndex

			const className = [
				"mr-2",
				!hasTranslation
					? "text-green-800"
					: beforeCurrent
					? "text-green-700 text-6xl"
					: "border-b-4 border-red-500 text-sm",
			].join(" ")

			const content = (() => {
				if (!hasTranslation) {
					return sect.phrase
				}
				if (atCurrent) {
					return (
						<span className="text-primary">{`${wordsInSection} Spanish Word(s)`}</span>
					)
				}
				if (afterCurrent) {
					return nonBreakingSpaces(30)
				}
				// before current: show the revealed translation or phraseTranslation
				if ("phraseTranslation" in sect && sect.phraseTranslation) {
					return Array.isArray(sect.phraseTranslation)
						? sect.phraseTranslation[0]
						: sect.phraseTranslation
				}
				if ("translation" in sect && sect.translation != null) {
					const t = sect.translation
					if (typeof t === "string") return t
					if (Array.isArray(t)) return t.map((w) => w.word).join(" ")
					return t.word
				}
				return ""
			})()

			return (
				<span
					key={index}
					className={className}
				>
					{content}
				</span>
			)
		})
	}, [
		currentSentence,
		quizType,
		currentSections,
		sectionIndex,
		userInput,
		wordsInSection,
	])

	useEffect(() => {
		// Optional: log once you see content appearing
		// console.log("Sentence ready:", { hasSentence: !!currentSentence })
	}, [currentSentence])

	if (!currentSentence) return null

	return (
		<div className="text-6xl text-spanishBlue flex flex-col justify-center items-center space-y-12">
			<div>{untranslatedSentence}</div>
			<div>{translatedSentence}</div>
		</div>
	)
}
