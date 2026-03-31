import { FaRegThumbsUp } from 'react-icons/fa';
import { FaRegThumbsDown } from 'react-icons/fa6';
import { FiCheck, FiX } from 'react-icons/fi';

function StudQuestionPaper({ el, idx }) {
	const isAnsCorrect = el?.q_ans?.toUpperCase() === el?.sqp_ans?.toUpperCase();
	const isObjectionQuestion = el?.is_objection_question === 1
	const optionKeys = ['a', 'b', 'c', 'd', 'e'];

	const renderOptionCard = (opt) => {
		const optionText = el[`q_${opt}`];
		if (!optionText) return null;

		const isStudentAnswer = el.sqp_ans?.toUpperCase() === opt.toUpperCase();
		const isCorrectAnswer = el.q_ans?.toUpperCase() === opt.toUpperCase();

		return (
			<div
				key={opt}
				className={`rounded-lg border p-3 transition-all text-sm relative group ${isCorrectAnswer
					? 'border-green-500 bg-green-100'
					: isStudentAnswer
						? 'border-blue-500 bg-blue-50'
						: 'border-gray-200 bg-white'
					}`}
			>
				<div className="font-semibold text-gray-600 mb-1 uppercase">Option {opt}</div>
				<div dangerouslySetInnerHTML={{ __html: optionText }} className="text-gray-800" />
				{isCorrectAnswer && (
					<span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
						<FiCheck size={12} />
						Correct
					</span>
				)}
				{isStudentAnswer && !isCorrectAnswer && (
					<span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
						<FiX size={12} />
						Your Answer
					</span>
				)}
			</div>
		);
	};

	return (
		<div
			className={`relative mb-6 w-full rounded-xl border-l-4 shadow-md transition-all p-6 space-y-5 ${isAnsCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
				}`}
		>
			{/* Top status bar */}
			<div className="flex justify-between items-center mb-3">
				<h4 className="text-lg font-semibold text-gray-800">
					Q.{idx + 1}
				</h4>
				<div className="flex gap-2">

					{isObjectionQuestion &&
						<span
							className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full text-white shadow bg-blue-500
								}`}
						>

							Updated for objection
						</span>
					}

					<span
						className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full text-white shadow ${isAnsCorrect ? 'bg-green-500' : 'bg-red-500'
							}`}
					>
						{isAnsCorrect ? <FaRegThumbsUp size={16} /> : <FaRegThumbsDown size={16} />}
						{isAnsCorrect ? 'Correct' : 'Wrong'}
					</span>

				</div>
			</div>

			{/* Question */}
			<div className="text-gray-700" dangerouslySetInnerHTML={{ __html: el.q }} />

			{/* Options */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{optionKeys.map((opt) => renderOptionCard(opt))}
			</div>

			{/* Correct and Student Answer Summary */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
				<div className="text-sm text-gray-600">
					<span className="font-semibold text-gray-800">Correct Option: </span>
					<span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded font-semibold">
						{el.q_ans?.toUpperCase() || '-'}
					</span>
				</div>
				<div className="text-sm text-gray-600">
					<span className="font-semibold text-gray-800">Student Option: </span>
					<span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded font-semibold">
						{el.sqp_ans?.toUpperCase() || '-'}
					</span>
				</div>
			</div>

			{/* Solution */}
			{el.q_sol && (
				<div className="mt-6 border-t pt-4">
					<span className="text-sm text-gray-600 font-medium mb-2 block">Solution</span>
					<div
						className="text-gray-700 text-sm"
						dangerouslySetInnerHTML={{ __html: el.q_sol }}
					/>
				</div>
			)}
		</div>
	);
}

export default StudQuestionPaper;
