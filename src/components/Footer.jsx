const Footer = () => {
	return (
		<footer className="bg-primary text-secondary shadow-2xl shadow-red-900 rounded-t-xl h-16 px-6 flex items-center justify-between text-sm z-10">
			<div></div>
			<div className="text-center w-full">
				<a
					href="#"
					className="hover:text-white"
				>
					Privacy Policy
				</a>{" "}
				|{" "}
				<a
					href="#"
					className="hover:text-white"
				>
					Terms of Service
				</a>
			</div>
			<div className="text-right w-full pr-4">
				SpanishTester © {new Date().getFullYear()}
			</div>
		</footer>
	)
}

export default Footer
