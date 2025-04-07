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

export interface Sentence {
	id: number
	sentence: string
	translation: string
	data: SentenceDataEntry[]
}

export type SentenceDataEntry =
	| {
			word: string
			translation?: WordObject | string
	  }
	| {
			phrase: string
			phraseTranslation?: string
			translation: WordObject | WordObject[] | string
			reference?: Record<string, number[]>
	  }
export interface Lesson {
	lesson: number
	name: string
	details: string
	info: string[]
	wordBank?: WordObject[]
	sentences?: Sentence[]
}
