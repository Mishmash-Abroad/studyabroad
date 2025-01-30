import React, { useState, useEffect } from "react";

const DEFAULT_QUESTIONS = [
  "Why do you want to participate in this study abroad program?",
  "How does this program align with your academic or career goals?",
  "What challenges do you anticipate during this experience, and how will you address them?",
  "Describe a time you adapted to a new or unfamiliar environment.",
  "What unique perspective or contribution will you bring to the group?",
];

const AdminProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [newProgram, setNewProgram] = useState({
    title: "",
    year_semester: "",
    description: "",
    faculty_leads: "",
    application_open_date: "",
    application_deadline: "",
    start_date: "",
    end_date: "",
  });
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const authToken = localStorage.getItem("authToken");

  // Fetch all programs
  const fetchPrograms = async () => {
    const response = await fetch("/api/programs/");
    if (response.ok) {
      const data = await response.json();
      setPrograms(data);
    }
  };

  // Fetch questions for the selected program
  const fetchQuestions = async (programId) => {
    setSelectedProgramId(programId);
    const response = await fetch(`/api/questions/?program=${programId}`);
    if (response.ok) {
      const data = await response.json();
      setQuestions(data);
    }
  };

  // Create a new program and auto-populate with default questions
  const createProgram = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/programs/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify(newProgram),
    });

    if (response.ok) {
      const programData = await response.json();
      const programId = programData.id;

      // Auto-create default questions for the new program
      await createDefaultQuestions(programId);

      fetchPrograms();
      setNewProgram({
        title: "",
        year_semester: "",
        description: "",
        faculty_leads: "",
        application_open_date: "",
        application_deadline: "",
        start_date: "",
        end_date: "",
      });
    } else {
      alert("Failed to create program.");
    }
  };

  // Create default questions for a program
  const createDefaultQuestions = async (programId) => {
    for (const text of DEFAULT_QUESTIONS) {
      await fetch("/api/questions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify({ text, program: programId, is_required: true }),
      });
    }
    fetchQuestions(programId);
  };

  // Create a new custom question
  const createQuestion = async () => {
    if (!selectedProgramId) return alert("Select a program first.");
    if (!newQuestion.trim()) return;

    const response = await fetch("/api/questions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({ text: newQuestion, program: selectedProgramId, is_required: true }),
    });

    if (response.ok) {
      fetchQuestions(selectedProgramId);
      setNewQuestion("");
    } else {
      alert("Failed to create question.");
    }
  };

  // Edit an application question
  const editQuestion = async (questionId, newText) => {
    const response = await fetch(`/api/questions/${questionId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({ text: newText }),
    });

    if (response.ok) {
      fetchQuestions(selectedProgramId);
    } else {
      alert("Failed to update question.");
    }
  };

  // Delete an application question
  const deleteQuestion = async (questionId) => {
    const response = await fetch(`/api/questions/${questionId}/`, {
      method: "DELETE",
      headers: { Authorization: `Token ${authToken}` },
    });

    if (response.ok) {
      fetchQuestions(selectedProgramId);
    } else {
      alert("Failed to delete question.");
    }
  };

  return (
    <div>
      <h2>Admin - Manage Study Abroad Programs</h2>

      {/* Create Program Form */}
      <h3>Create a New Program</h3>
      <form onSubmit={createProgram}>
        <input type="text" name="title" placeholder="Title" value={newProgram.title} onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })} required />
        <input type="text" name="year_semester" placeholder="Year & Semester" value={newProgram.year_semester} onChange={(e) => setNewProgram({ ...newProgram, year_semester: e.target.value })} required />
        <textarea name="description" placeholder="Description" value={newProgram.description} onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}></textarea>
        <input type="text" name="faculty_leads" placeholder="Faculty Leads" value={newProgram.faculty_leads} onChange={(e) => setNewProgram({ ...newProgram, faculty_leads: e.target.value })} required />
        <input type="date" name="application_open_date" value={newProgram.application_open_date} onChange={(e) => setNewProgram({ ...newProgram, application_open_date: e.target.value })} required />
        <input type="date" name="application_deadline" value={newProgram.application_deadline} onChange={(e) => setNewProgram({ ...newProgram, application_deadline: e.target.value })} required />
        <input type="date" name="start_date" value={newProgram.start_date} onChange={(e) => setNewProgram({ ...newProgram, start_date: e.target.value })} required />
        <input type="date" name="end_date" value={newProgram.end_date} onChange={(e) => setNewProgram({ ...newProgram, end_date: e.target.value })} required />
        <button type="submit">Create Program</button>
      </form>

      {/* Program Selection */}
      <h3>Programs</h3>
      <ul>
        {programs.map((program) => (
          <li key={program.id}>
            {program.title} ({program.year_semester}){" "}
            <button onClick={() => fetchQuestions(program.id)}>Manage Questions</button>
          </li>
        ))}
      </ul>

      {/* Manage Application Questions */}
      {selectedProgramId && (
        <div>
          <h3>Application Questions</h3>
          <ul>
            {questions.map((q) => (
              <li key={q.id}>
                <input type="text" defaultValue={q.text} onBlur={(e) => editQuestion(q.id, e.target.value)} />
                <button onClick={() => deleteQuestion(q.id)}>Delete</button>
              </li>
            ))}
          </ul>

          {/* Add New Question */}
          <input type="text" placeholder="New Question" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
          <button onClick={createQuestion}>Add Question</button>
        </div>
      )}
    </div>
  );
};

export default AdminProgramManagement;
