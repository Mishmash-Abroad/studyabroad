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
    const [expanded, setExpanded] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Date calculations
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

    const getStatusBadge = () => {
        let style = {
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1
        };

        if (applicationStatus === 'Enrolled' || applicationStatus === 'Applied') {
            return {
                text: applicationStatus,
                style: {
                    ...style,
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2'
                }
            };
        }

        if (applicationStatus === 'Withdrawn' || applicationStatus === 'Canceled') {
            return {
                text: applicationStatus,
                style: {
                    ...style,
                    backgroundColor: '#fce4ec',
                    color: '#c2185b'
                }
            };
        }

        if (today < applicationOpenDate) {
            return {
                text: 'Opening Soon',
                style: {
                    ...style,
                    backgroundColor: '#fff3e0',
                    color: '#f57c00'
                }
            };
        }

        if (today > applicationDeadline) {
            return {
                text: 'Closed',
                style: {
                    ...style,
                    backgroundColor: '#ffebee',
                    color: '#c62828'
                }
            };
        }

        return {
            text: 'Open',
            style: {
                ...style,
                backgroundColor: '#e8f5e9',
                color: '#2e7d32'
            }
        };
    };

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
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/apply/${program.id}`);
                        }}
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
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/apply/${program.id}`);
                }}
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

    const badge = getStatusBadge();

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: expanded ? 'scale(1.02)' : 'scale(1)',
                height: expanded ? 'auto' : '200px'
            }}
        >
            {/* Background image placeholder */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#f5f5f5',
                opacity: 0.8,
                zIndex: 0
            }} />

            {/* Status badge */}
            <div style={badge.style}>
                {badge.text}
            </div>

            {/* Program title and location */}
            <div style={{
                position: 'absolute',
                bottom: expanded ? 'auto' : '20px',
                left: '20px',
                right: '20px',
                padding: '10px',
                zIndex: 1
            }}>
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '24px',
                    color: '#1a237e',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                    {program.title}
                </h3>
                <p style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#424242',
                    opacity: 0.9
                }}>
                    {program.location}
                </p>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div style={{
                    padding: '20px',
                    marginTop: '100px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    zIndex: 1,
                    position: 'relative'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ color: '#666', margin: '0 0 5px 0' }}>
                            {program.year_semester} • Led by {program.faculty_leads}
                        </p>
                        <p style={{ margin: '15px 0' }}>{program.description}</p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        backgroundColor: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px'
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

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '20px'
                    }}>
                        {getApplicationButton()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramCard;
