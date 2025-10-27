import React, { useState } from 'react';
// Assuming you corrected the typo in the import path in your filesystem:
// import QuestionForm from './components/QuestionsForm'; -> import QuestionForm from './components/QuestionForm';
import QuestionForm from './components/QuestionsForm'; 
import './App.css'; 

function App() {
    const today = new Date().toISOString().split('T')[0];

    // Main Content State
    const [title, setTitle] = useState('');
    const [paragraphInput, setParagraphInput] = useState('');
    const [date, setDate] = useState(today);
    const [questions, setQuestions] = useState([]);
    
    // UI/Submission State
    const [jsonOutput, setJsonOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(''); // 'success', 'error', 'pending'

    const API_URL = 'https://penverse-app-backend-2.onrender.com/api/v1/editorials/';

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { statement: '', options: [{ statement: '' }], correctAnswer: '' },
        ]);
    };

    const handleUpdateQuestion = (index, updatedQuestion) => {
        const newQuestions = questions.map((q, i) =>
            i === index ? updatedQuestion : q
        );
        setQuestions(newQuestions);
    };

    const handleDeleteQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    // --- NEW COMBINED SUBMISSION FUNCTION ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus('pending');
        setIsLoading(true);

        const paragraphArray = paragraphInput
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0);

        const finalJson = {
            title,
            paragraph: paragraphArray,
            questions,
            date,
        };
        
        // 1. Update Preview (Local State)
        setJsonOutput(JSON.stringify(finalJson, null, 2));

        // 2. Post Data (API Call)
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization headers if required by your backend
                },
                body: JSON.stringify(finalJson),
            });

            if (!response.ok) {
                // Read the error message from the response body if available
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            // Success
            const result = await response.json();
            console.log('Submission Success:', result);
            setSubmissionStatus('success');
            // Optional: Clear form here or update UI
            
        } catch (error) {
            // Failure
            console.error('Submission Error:', error.message);
            setSubmissionStatus('error');
            setJsonOutput(`Submission failed: ${error.message}\n\n${JSON.stringify(finalJson, null, 2)}`); // Show JSON + error
        } finally {
            setIsLoading(false);
        }
    };
    // ----------------------------------------

    return (
        <div className="app-container">
            <header>
                <h1>JSON Content Generator</h1>
                <p className={`status-message ${submissionStatus}`}>
                    {submissionStatus === 'success' && '✅ Data successfully posted!'}
                    {submissionStatus === 'error' && '❌ Submission failed. Check console for details.'}
                    {isLoading && '⏳ Submitting data...'}
                </p>
            </header>
            
            <main className="content-layout">
                {/* Wrap the form section in a <form> element for proper submission handling */}
                <section className="form-section">
                    <form onSubmit={handleSubmit}>
                        <h2>Content Details</h2>
                        
                        <div className="form-row">
                            <label className="label-block">
                                Title:
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter the article title"
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-row">
                            <label className="label-block">
                                Date:
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="form-row">
                            <label className="label-block">
                                Paragraphs (Separate with a double line break):
                                <textarea
                                    className="paragraph-area"
                                    value={paragraphInput}
                                    onChange={(e) => setParagraphInput(e.target.value)}
                                    rows="10"
                                    placeholder="Enter each paragraph on a new line."
                                    required
                                />
                            </label>
                        </div>

                        <h2>Questions Section</h2>
                        {questions.map((question, index) => (
                            <QuestionForm
                                key={index}
                                index={index}
                                question={question}
                                onUpdate={handleUpdateQuestion}
                                onDelete={handleDeleteQuestion}
                            />
                        ))}

                        <button type="button" className="add-question-btn" onClick={handleAddQuestion}>
                            + Add New Question
                        </button>
                        
                        <button type="submit" className="generate-btn" disabled={isLoading}>
                            {isLoading ? 'SUBMITTING...' : 'SUBMIT & PREVIEW JSON'}
                        </button>
                    </form>
                </section>

                {/* --- JSON Output (Right/Bottom) --- */}
                <section className="output-section">
                    <h2>Generated JSON Preview</h2>
                    <pre className="json-output-area">
                        {jsonOutput || 'The generated JSON will appear here after submission.'}
                    </pre>
                </section>
            </main>
        </div>
    );
}

export default App;