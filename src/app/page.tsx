// app/page.tsx or src/app/page.tsx
"use client"

import Header from "@/components/Header"
import Main from "@/components/Main"
import LessonInfoModal from "@/components/LessonInfoModal"

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<div className="flex-grow flex items-center justify-center">
				<Main />
			</div>
			<LessonInfoModal />
		</div>
	)
}
