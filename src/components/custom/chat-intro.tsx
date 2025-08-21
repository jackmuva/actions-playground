export const ChatIntro = () => {
	return (
		<div className='h-full w-full flex flex-col items-center justify-center space-y-2'>
			<h2 className='font-semibold text-4xl text-center'>
				ActionKit-Powered Agent
			</h2>
			<h3 className='text-xl text-center'>
				An example of ActionKit in action to easily give your agent access to 1000+ pre-built tools
			</h3>
			<p className="text-center">
				Browse the full array of supported integrations and actions in&nbsp;
				<a href='https://docs.useparagon.com/actionkit/overview' target='_blank'
					className='text-indigo-700 font-semibold underline 
								inline-block transition-all duration-300 ease-in-out
								hover:text-indigo-500 hover:-translate-y-0.5'>
					the ActionKit docs
				</a>
			</p>
		</div>

	);
}
