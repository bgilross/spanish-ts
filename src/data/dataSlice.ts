import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface QuizState {
	currentLessonIndex: number
	currentSentenceIndex: number
}

const initialState: QuizState = {
	currentLessonIndex: 0,
	currentSentenceIndex: 0,
}

const dataSlice = createSlice({
	name: "data",
	initialState,
	reducers: {
		setLesson(state, action: PayloadAction<number>) {
			state.currentLessonIndex = action.payload
			state.currentSentenceIndex = 0
		},
		setSentence(state, action: PayloadAction<number>) {
			state.currentSentenceIndex = action.payload
		},
		resetQuiz(state) {
			state.currentLessonIndex = 0
			state.currentSentenceIndex = 0
		},
	},
})

export const { setLesson, setSentence, resetQuiz } = dataSlice.actions

export default dataSlice.reducer
