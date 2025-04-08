export interface Lesson {
	lesson: number
	name: string
	details: string
	info: string[]
	wordBank?: WordObject[]
	sentences?: Sentence[]
}

export interface Sentence {
	id: number
	sentence: string
	translation: string
	data: SentenceDataEntry[]
	noPronoun?: boolean
}

// Enhanced Word Object interface
export interface WordObject {
	id: string
	word: string
	translations: string[]
	pos: string
	gender?: string
	tense?: string
	person?: string
	audio?: string
	info: string[]
}

// For referencing words in translation objects
export type WordReference = {
	id: string
	referenceIndices?: number[]
}

// Improved sentence data entry
export type SentenceDataEntry =
	| {
			phrase: string
			translation?: WordObject | string
			mixup?: WordObject | WordObject[] // For when a word might be confused with another
	  }
	| {
			phrase: string
			phraseTranslation?: string | string[]
			translation: WordObject | WordObject[] | string
			reference?: Record<string, (number | string)[]>
			mixup?: WordObject
	  }

// Helper types for your word structures
export type WordGroup = {
	id: string
	name: string
	info: string[]
	words: Record<string, WordObject>
}

export interface VerbConjugation extends WordObject {
	tense: string
	person: string
}

export interface VerbRoot extends WordObject {
	info: string[]
	present: Record<string, VerbConjugation>
	// past: Record<string, VerbConjugation>
}

export interface VerbGroup {
	id: string
	name: string
	info: string[]
	words: Record<string, VerbRoot>
}
