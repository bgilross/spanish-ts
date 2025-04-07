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
	info?: string[]
}

// For referencing words in translation objects
export type WordReference = {
	id: string
	referenceIndices?: number[]
}

// Improved sentence data entry
export type SentenceDataEntry =
	| {
			word: string
			translation?: WordObject | string
			mixup?: WordObject // For when a word might be confused with another
	  }
	| {
			phrase: string
			phraseTranslation?: string
			translation: WordObject | WordObject[] | string
			reference?: Record<string, (number | string)[]>
			mixup?: WordObject
	  }

export interface Sentence {
	id: number
	sentence: string
	translation: string
	data: SentenceDataEntry[]
	noPronoun?: boolean
}

export interface Lesson {
	lesson: number
	name: string
	details: string
	info: string[]
	wordBank?: WordObject[]
	sentences?: Sentence[]
}

// Helper types for your word structures
export interface WordGroup {
	name: string | string[]
	info: string[]
	[key: string]: WordObject | string | string[]
}

export interface VerbConjugation extends WordObject {
	tense: string
	person: string
}

export interface VerbRoot extends WordObject {
	info: string[]
	present?: Record<string, VerbConjugation>
	past?: Record<string, VerbConjugation>
}

export interface VerbGroup {
	id: string
	name: string
	info: string[]
	ser: VerbRoot
	[key: string]: VerbRoot | string[] | string
}
