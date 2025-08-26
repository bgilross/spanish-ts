"use client"

import { useDataStore } from "@/data/dataStore"
import Sentence from "./Sentence"

const Main = () => {
	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-4 text-center">
			<Sentence />
		</div>
	)
}

export default Main
