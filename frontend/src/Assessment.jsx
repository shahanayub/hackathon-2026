import React, { useState } from 'react';
import { BrainCircuit, ArrowRight } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    topic: "Python",
    question: "Which of the following is used to define a block of code in Python?",
    options: ["Curly braces {}", "Indentation", "Parentheses ()", "Square brackets []"],
    answer: "Indentation"
  },
  {
    id: 2,
    topic: "Web Development",
    question: "In React, what hook is used to manage local component state?",
    options: ["useEffect", "useState", "useContext", "useReducer"],
    answer: "useState"
  },
  {
    id: 3,
    topic: "Git",
    question: "Which command is used to create and switch to a new branch in Git?",
    options: ["git branch -m", "git checkout -b", "git switch -c", "Both B and C"],
    answer: "Both B and C"
  },
  {
    id: 4,
    topic: "DevOps",
    question: "What is the primary purpose of a Dockerfile?",
    options: ["To deploy code to AWS", "To build a Docker image", "To manage Kubernetes clusters", "To run a virtual machine"],
    answer: "To build a Docker image"
  },
  {
    id: 5,
    topic: "AI",
    question: "In Generative AI, what does RAG stand for?",
    options: ["Random Access Generation", "Retrieval-Augmented Generation", "Real-time AI Generation", "Recursive Algorithm Gateway"],
    answer: "Retrieval-Augmented Generation"
  }
];

export default function Assessment({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: option
    });
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    QUESTIONS.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correct++;
      }
    });
    const finalScore = (correct / QUESTIONS.length) * 100;
    setScore(finalScore);
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <div className="bg-slate-900 p-8 text-center mt-8">
        <BrainCircuit className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h2>
        <p className="text-slate-400 mb-6">Based on your answers, here is your foundational skill score.</p>
        
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-indigo-950/50">
            <span className="text-4xl font-bold text-indigo-400">{score}%</span>
          </div>
        </div>

        <button 
          onClick={() => onComplete(score)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-colors"
        >
          Proceed to Roadmap <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <div className="bg-slate-900 p-8 mt-8">
      <div className="flex justify-between items-center mb-6 text-sm font-semibold tracking-wider text-slate-500 uppercase">
        <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
        <span className="bg-indigo-950 text-indigo-400 px-3 py-1 rounded-full">{question.topic}</span>
      </div>

      <h3 className="text-xl text-white font-medium mb-6">{question.question}</h3>

      <div className="space-y-3 mb-8">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selectedAnswers[currentQuestion] === option 
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedAnswers[currentQuestion]}
        className="w-full bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 hover:bg-indigo-500 text-white p-4 rounded-xl font-medium transition-colors"
      >
        {currentQuestion === QUESTIONS.length - 1 ? 'Submit Assessment' : 'Next Question'}
      </button>
    </div>
  );
}