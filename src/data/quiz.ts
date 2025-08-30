import type {
	Lesson,
	Sentence,
	SentenceDataEntry,
	WordObject,
	QuizType,
	TranslatedWordEntry,
	ErrorWord,
	ErrorEntry,
	CurrentSectionEntry,
	SubmissionLog,
} from "@/types/types"

export function sanitize(str: string) {
	return (str ?? "")
		.replace(/[.,/#!$%^&*;:{}=\-_`~()?']/g, "")
		.trim()
		.toLowerCase()
}

export function shuffle<T>(arr: T[]): T[] {
	const a = arr.slice()
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[a[i], a[j]] = [a[j], a[i]]
	}
	return a
}

export function getCurrentSectionsForSentence(
	sentence: Sentence | undefined
): CurrentSectionEntry[] {
	if (!sentence) return []
	return (sentence.data ?? [])
		.map((section, index) => {
			const hasTranslation =
				"translation" in section &&
				section.translation !== undefined &&
				section.translation !== null
			return hasTranslation ? { section, index } : null
		})
		.filter(Boolean) as CurrentSectionEntry[]
}

export function isCorrectAnswer(
	quizType: QuizType,
	input: string,
	section: SentenceDataEntry,
	sentence: Sentence
): boolean {
	const cleanInput = sanitize(input)

	if (quizType === "parts") {
		const phrase =
			"phraseTranslation" in section ? section.phraseTranslation : undefined
		if (typeof phrase === "string" && phrase) {
			return cleanInput === sanitize(phrase)
		}
		if (Array.isArray(phrase) && phrase.length) {
			return phrase.map(sanitize).some((p) => p === cleanInput)
		}

		if ("translation" in section && section.translation != null) {
			const t = section.translation
			if (typeof t === "string") {
				return cleanInput === sanitize(t)
			} else if (Array.isArray(t)) {
				const joined = sanitize(t.map((w) => w.word).join(" "))
				if (joined.length > 0 && cleanInput === joined) return true
				const tokens = new Set(cleanInput.split(/\s+/).filter(Boolean))
				return t.every((w) => tokens.has(sanitize(w.word)))
			} else {
				return cleanInput === sanitize(t.word)
			}
		}
		return false
	}

	return cleanInput === sanitize(sentence.translation)
}

export function findErrors(params: {
	quizType: QuizType
	currentSection: SentenceDataEntry
	currentSentence: Sentence
	userWords: string[]
	sectionInd: number
}): ErrorWord[] {
	const { quizType, currentSection, currentSentence, userWords, sectionInd } =
		params
	const errorWords: ErrorWord[] = []

	const addWordIfMissing = (
		w: WordObject,
		idx: number,
		sect: SentenceDataEntry
	) => {
		if (!userWords.includes(sanitize(w.word))) {
			errorWords.push({
				word: w,
				sectionInd: idx,
				phrase:
					"phraseTranslation" in sect ? sect.phraseTranslation : undefined,
				currentSection: sect,
			})
		}
	}

	if (quizType === "parts") {
		if ("translation" in currentSection && currentSection.translation != null) {
			const t = currentSection.translation
			if (Array.isArray(t)) {
				t.forEach((w) => addWordIfMissing(w, sectionInd, currentSection))
			} else if (typeof t !== "string") {
				addWordIfMissing(t, sectionInd, currentSection)
			}
		}
	} else {
		currentSentence.data.forEach((sect, idx) => {
			if (!("translation" in sect) || sect.translation == null) return
			const t = sect.translation
			if (Array.isArray(t)) {
				t.forEach((w) => addWordIfMissing(w, idx, sect))
			} else if (typeof t !== "string") {
				addWordIfMissing(t, idx, sect)
			}
		})
	}

	return errorWords
}

// Faithful to original reference mapping logic
export function findErrorRefs(params: {
	quizType: QuizType
	currentSection: SentenceDataEntry
	currentSentence: Sentence
	errorWords: ErrorWord[]
	sectionInd: number
}): string[] {
	const { quizType, currentSection, currentSentence, errorWords, sectionInd } =
		params
	const refs: string[] = []

	const pushRefsFrom = (word: WordObject, fromSection: SentenceDataEntry) => {
		if (!("reference" in fromSection) || !fromSection.reference) return
		const arr = (fromSection.reference as any)[word.id] as
			| Array<number | string>
			| undefined
		if (!arr) return
		arr.forEach((idxOrKey) => {
			const info = word.info as string[] | undefined
			if (!info) return
			if (typeof idxOrKey === "number") {
				const ref = info[idxOrKey]
				if (ref && !refs.includes(ref)) refs.push(ref)
			} else {
				const maybeNum = Number(idxOrKey)
				if (
					Number.isInteger(maybeNum) &&
					info[maybeNum] &&
					!refs.includes(info[maybeNum])
				) {
					refs.push(info[maybeNum])
				} else if (!refs.includes(idxOrKey)) {
					refs.push(idxOrKey)
				}
			}
		})
	}

	if (quizType === "parts") {
		if ("reference" in currentSection && currentSection.reference) {
			errorWords.forEach((err) => {
				if (err.sectionInd === sectionInd) {
					pushRefsFrom(err.word, currentSection)
				}
			})
		}
	} else {
		errorWords.forEach((err) => {
			currentSentence.data.forEach((sect) => {
				pushRefsFrom(err.word, sect)
			})
		})
	}

	return refs
}

export function computeNextSectionIndex(
	sentence: Sentence | undefined,
	translated: TranslatedWordEntry[]
): number | null {
	if (!sentence) return null
	const taken = new Set(translated.map((t) => t.index))
	const nextIndex = sentence.data.findIndex((section, idx) => {
		const hasTranslation =
			"translation" in section &&
			section.translation !== undefined &&
			section.translation !== null
		return hasTranslation && !taken.has(idx)
	})
	return nextIndex === -1 ? null : nextIndex
}
