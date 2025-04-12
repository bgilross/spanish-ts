"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function ClientLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex flex-col h-screen w-full overflow-hidden">
			<Header />
			<main className="flex-1 overflow-hidden">{children}</main>
			<Footer />
		</div>
	)
}
