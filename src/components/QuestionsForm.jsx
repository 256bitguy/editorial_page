import React, { useState, useEffect } from 'react';

const QuestionForm = ({ index, question, onUpdate, onDelete }) => {
    const [statement, setStatement] = useState(question.statement || '');
    const [options, setOptions] = useState(question.options || [{ statement: '' }]);
    const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || '');

    // Effect to lift state up whenever local state changes
    useEffect(() => {
        onUpdate(index, { statement, options, correctAnswer });
    }, [statement, options, correctAnswer]);

    const handleOptionChange = (optionIndex, value) => {
        const newOptions = options.map((opt, i) =>
            i === optionIndex ? { ...opt, statement: value } : opt
        );
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, { statement: '' }]);
    };

    const deleteOption = (optionIndex) => {
        if (options.length > 1) {
            // If the deleted option was the currently set correct answer, clear it.
            if (options[optionIndex].statement === correctAnswer) {
                setCorrectAnswer('');
            }
            setOptions(options.filter((_, i) => i !== optionIndex));
        }
    };

    // --- NEW HANDLER ---
    const handleSetCorrect = (optionStatement) => {
        setCorrectAnswer(optionStatement);
    };
    // -------------------

    return (
        <div className="question-card">
            <div className="form-row">
                <label className="label-block">
                    Question {index + 1} Statement:
                    <textarea
                        value={statement}
                        onChange={(e) => setStatement(e.target.value)}
                        placeholder="Enter the question statement"
                    />
                </label>
            </div>

            <div className="options-container">
                <h4 className="options-header">Options:</h4>
                {options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option-row">
                        <input
                            type="text"
                            value={option.statement}
                            onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                        />
                        
                        {/* --- NEW BUTTON: Set as Correct --- */}
                        {option.statement && (
                            <button 
                                type="button" 
                                onClick={() => handleSetCorrect(option.statement)} 
                                className="set-correct-btn"
                                // Optional: visually indicate which is selected
                                style={{
                                    backgroundColor: option.statement === correctAnswer ? '#28a745' : '#17a2b8',
                                    color: 'white',
                                }}
                            >
                                {option.statement === correctAnswer ? '✓ Correct' : 'Set Correct'}
                            </button>
                        )}
                        {/* ---------------------------------- */}
                        
                        <button type="button" onClick={() => deleteOption(optionIndex)} className="delete-option-btn">
                            &times;
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addOption} className="add-option-btn">
                    + Add Option
                </button>
            </div>

            <div className="form-row">
                <label className="label-block">
                    Correct Answer:
                    {/* The input field remains for manual override */}
                    <input
                        type="text"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        placeholder="Click 'Set Correct' or type the answer manually"
                    />
                </label>
            </div>
            
            <button type="button" onClick={() => onDelete(index)} className="delete-question-btn">
                Delete this Question
            </button>
        </div>
    );
};

export default QuestionForm;