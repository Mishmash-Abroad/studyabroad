/**
 * Study Abroad Program - Program Card Component
 * =========================================
 * 
 * This component displays detailed information about a single study abroad program.
 * It handles the display of program details, application status, and provides
 * appropriate actions based on the current state of the application process.
 * 
 * Features:
 * - Dynamic application button states
 * - Real-time application status display
 * - Date-aware application windows
 * - Responsive layout
 * - Admin vs student view handling
 * 
 * Application States:
 * - Not Open: Before application window
 * - Open: During application window
 * - Closed: After application deadline
 * - Applied: Application submitted
 * - Enrolled: Student accepted and enrolled
 * - Withdrawn/Canceled: Previous application exists
 * 
 * Used by:
 * - ProgramBrowser for program listing
 * - Dashboard for program management
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

/**
 * Program Card Component
 * 
 * @param {Object} props
 * @param {Object} props.program - Program data object containing details about the study abroad program
 */
const ProgramCard = ({ program }) => {
    // State and context management
    const [applicationStatus, setApplicationStatus] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Date calculations for application window
    const today = new Date();
    const applicationOpenDate = new Date(program.application_open_date);
    const applicationDeadline = new Date(program.application_deadline);

    /**
     * Effect hook to fetch the current user's application status for this program
     */
    useEffect(() => {
        const fetchApplicationStatus = async () => {
            try {
                const response = await axiosInstance.get(`/api/programs/${program.id}/application_status/`);
                setApplicationStatus(response.data.status);
            } catch (error) {
                console.error('Error fetching application status:', error);
            }
        };
        fetchApplicationStatus();
    }, [program.id]);

    /**
     * Determines and returns the appropriate application button or status badge
     * based on current application status and dates
     * 
     * @returns {JSX.Element} Button or status badge component
     */
    const getApplicationButton = () => {
        // For enrolled or applied applications, show status badge
        if (applicationStatus === 'Enrolled' || applicationStatus === 'Applied') {
            return (
                <div className="status-badge" style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    display: 'inline-block'
                }}>
                    Status: {applicationStatus}
                </div>
            );
        }

        // For withdrawn or cancelled applications, show apply button with status note
        if (applicationStatus === 'Withdrawn' || applicationStatus === 'Canceled') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <button
                        onClick={() => navigate(`/apply/${program.id}`)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Apply Again
                    </button>
                    <div style={{
                        fontSize: '0.8em',
                        color: '#666',
                        fontStyle: 'italic'
                    }}>
                        Previously {applicationStatus.toLowerCase()}
                    </div>
                </div>
            );
        }

        // Application window not yet open
        if (today < applicationOpenDate) {
            return (
                <div className="not-open-badge" style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    backgroundColor: '#fff3e0',
                    color: '#f57c00'
                }}>
                    Applications open on {program.application_open_date}
                </div>
            );
        }

        // Application deadline passed
        if (today > applicationDeadline) {
            return (
                <div className="deadline-passed-badge" style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    backgroundColor: '#ffebee',
                    color: '#c62828'
                }}>
                    Application Deadline Passed
                </div>
            );
        }

        // Default apply button (disabled for admin users)
        return (
            <button
                onClick={() => navigate(`/apply/${program.id}`)}
                disabled={user?.is_admin}
                style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    backgroundColor: user?.is_admin ? '#ccc' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    cursor: user?.is_admin ? 'not-allowed' : 'pointer'
                }}
            >
                Apply Now
            </button>
        );
    };

    return (
        <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            {/* Program header with title and action button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>{program.title}</h3>
                    <p style={{ color: '#666', margin: '0 0 5px 0' }}>
                        {program.year_semester} • Led by {program.faculty_leads}
                    </p>
                </div>
                <div>
                    {getApplicationButton()}
                </div>
            </div>
            
            {/* Program description */}
            <p style={{ margin: '15px 0' }}>{program.description}</p>
            
            {/* Program dates and details */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                marginTop: '15px'
            }}>
                <div>
                    <strong>Application Window:</strong>
                    <div>{program.application_open_date} - {program.application_deadline}</div>
                </div>
                <div>
                    <strong>Program Dates:</strong>
                    <div>{program.start_date} - {program.end_date}</div>
                </div>
            </div>
        </div>
    );
};

export default ProgramCard;
