import { create } from "zustand"

interface UIState {
	showLessonInfoModal: boolean
	openLessonInfoModal: () => void
	closeLessonInfoModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
	showLessonInfoModal: true,
	openLessonInfoModal: () => set({ showLessonInfoModal: true }),
	closeLessonInfoModal: () => set({ showLessonInfoModal: false }),
}))
