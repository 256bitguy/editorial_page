import React, { useState } from 'react';
// Assuming the file path is actually correct on your system, even if it was typo'd previously
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

    // --- NEW MODAL STATE ---
    const [showDailyModal, setShowDailyModal] = useState(false);
    const [latestEditorialId, setLatestEditorialId] = useState(null);
    const [dailyDate, setDailyDate] = useState(today);
    const [isDailyPosting, setIsDailyPosting] = useState(false);

    // API URLs
    const EDITORIAL_API_URL = 'https://penverse-app-backend-2.onrender.com/api/v1/editorials';
    const DAILY_API_URL = 'https://penverse-app-backend-2.onrender.com/api/v1/dailyeditorial';
    // --- END NEW MODAL STATE ---

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

    // --- MODIFIED SUBMISSION FUNCTION ---
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
        
        setJsonOutput(JSON.stringify(finalJson, null, 2));

        try {
            const response = await fetch(EDITORIAL_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalJson),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            // SUCCESS STEP 1: Get the result and prepare for the next step
            const result = await response.json();
            console.log('Editorial Submission Success:', result);
            
            // Assuming the successful response object (result) contains the _id property at the top level
            if (result._id) {
                setLatestEditorialId(result._id);
                setShowDailyModal(true); // Open the modal
                setSubmissionStatus('success');
            } else {
                 setSubmissionStatus('error');
                 setJsonOutput('Submission Success, but missing _id for daily update.');
            }
            
        } catch (error) {
            console.error('Submission Error:', error.message);
            setSubmissionStatus('error');
            setJsonOutput(`Submission failed: ${error.message}\n\n${JSON.stringify(finalJson, null, 2)}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- NEW MODAL SUBMISSION HANDLER ---
    const handleDailySubmit = async () => {
        if (!latestEditorialId || !dailyDate) return;

        setIsDailyPosting(true);
        try {
            const payload = { 
                list: [latestEditorialId], 
                date: dailyDate 
            };
            
            const response = await fetch(DAILY_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Daily post failed! Status: ${response.status}`);
            }

            console.log('Daily Editorial Post Success!');
            alert(`✅ Successfully added Editorial ID ${latestEditorialId} to Daily for ${dailyDate}!`);
            setShowDailyModal(false); // Close modal on success

        } catch (error) {
            console.error('Daily Post Error:', error.message);
            alert(`❌ Failed to post to Daily Editorial: ${error.message}`);
        } finally {
            setIsDailyPosting(false);
        }
    };
    // ----------------------------------------
    
    // --- Daily Editorial Modal Component (Rendered inline) ---
    const DailyEditorialModal = () => {
        if (!showDailyModal) return null;

        return (
            <div className="modal-backdrop">
                <div className="modal-content">
                    <h3>Add to Today's Daily Editorial?</h3>
                    <p className="success-message-in-modal">✅ Editorial posted successfully! ID: <strong>{latestEditorialId}</strong></p>

                    <div className="form-row">
                        <label className="label-block">
                            Select Date for Daily Post:
                            <input
                                type="date"
                                value={dailyDate}
                                onChange={(e) => setDailyDate(e.target.value)}
                            />
                        </label>
                    </div>
                    
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={() => setShowDailyModal(false)} 
                            className="modal-cancel-btn"
                            disabled={isDailyPosting}
                        >
                            No, Close
                        </button>
                        <button 
                            type="button" 
                            onClick={handleDailySubmit} 
                            className="modal-confirm-btn"
                            disabled={isDailyPosting}
                        >
                            {isDailyPosting ? 'Posting...' : 'Confirm & Post to Daily'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    // -----------------------------------------------------------

    return (
        <div className="app-container">
            <header>
                <h1>JSON Content Generator</h1>
                <p className={`status-message ${submissionStatus}`}>
                    {submissionStatus === 'success' && `✅ Editorial posted! ID: ${latestEditorialId} - Click to add to Daily.`}
                    {submissionStatus === 'error' && '❌ Submission failed. Check console for details.'}
                    {isLoading && '⏳ Submitting data...'}
                </p>
            </header>
            
            <main className="content-layout">
                {/* ... (Form section remains the same) ... */}
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

            {/* Render the Modal */}
            <DailyEditorialModal /> 
        </div>
    );
}

export default App;