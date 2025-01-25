/**
 * Study Abroad Program - Program Browser Component
 * ============================================
 * 
 * This component provides a searchable list of available study abroad programs.
 * It handles program data fetching, search functionality, and displays individual
 * program cards.
 * 
 * Features:
 * - Real-time search with debouncing
 * - Loading and error states
 * - Empty state handling
 * - Responsive grid layout
 * 
 * Used by:
 * - Dashboard component for program browsing
 * - Admin interface for program management
 */

import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import ProgramCard from './ProgramCard';

const ProgramBrowser = () => {
    // State management for programs and UI states
    const [programs, setPrograms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [showPastPrograms, setShowPastPrograms] = useState(false);

    // Effect hook for fetching programs
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/programs/', {
                    params: {
                        search: searchTerm
                    }
                });

                // Fetch application status for each program
                const programsWithStatus = await Promise.all(
                    response.data.map(async (program) => {
                        try {
                            const statusResponse = await axiosInstance.get(
                                `/api/programs/${program.id}/application_status/`
                            );
                            return {
                                ...program,
                                applicationStatus: statusResponse.data.status || null
                            };
                        } catch (error) {
                            console.error('Error fetching status:', error);
                            return {
                                ...program,
                                applicationStatus: null
                            };
                        }
                    })
                );

                setPrograms(programsWithStatus);
                setError(null);
            } catch (err) {
                console.error('Error fetching programs:', err);
                setError('Failed to load programs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchPrograms, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Filter programs based on current state
    const getFilteredPrograms = () => {
        const today = new Date();
        
        return programs.filter(program => {
            const openDate = new Date(program.application_open_date);
            const deadline = new Date(program.application_deadline);

            // First check if we should filter out past programs
            if (!showPastPrograms && today > deadline) {
                return false;
            }

            switch (filter) {
                case 'open':
                    // Only show programs where applications are currently open
                    return today >= openDate && today <= deadline;
                case 'applied':
                    // Show programs where the user has applied
                    return program.applicationStatus && program.applicationStatus.toLowerCase() === 'applied';
                case 'enrolled':
                    // Show programs where the user is enrolled
                    return program.applicationStatus && program.applicationStatus.toLowerCase() === 'enrolled';
                default:
                    // Show all programs (past programs already filtered above)
                    return true;
            }
        });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header with search and filters */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* Title and Search */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '28px', color: '#1a237e' }}>
                        Study Abroad Programs
                    </h2>
                    <div style={{ width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Search programs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '2px solid #e0e0e0',
                                fontSize: '16px',
                                transition: 'border-color 0.2s',
                                outline: 'none',
                                '&:focus': {
                                    borderColor: '#1a237e'
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Filter buttons and toggle */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    alignItems: 'center'
                }}>
                    {/* Filter buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center'
                    }}>
                        {[
                            { id: 'all', label: 'All Programs' },
                            { id: 'open', label: 'Open for Applications' },
                            { id: 'applied', label: 'Applied' },
                            { id: 'enrolled', label: 'Enrolled' }
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setFilter(id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    backgroundColor: filter === id ? '#1a237e' : '#e0e0e0',
                                    color: filter === id ? 'white' : '#424242',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: filter === id ? '600' : '400',
                                    '&:hover': {
                                        backgroundColor: filter === id ? '#1a237e' : '#bdbdbd'
                                    }
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Past programs toggle */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }} onClick={() => setShowPastPrograms(!showPastPrograms)}>
                        <div style={{
                            width: '36px',
                            height: '20px',
                            backgroundColor: showPastPrograms ? '#1a237e' : '#e0e0e0',
                            borderRadius: '10px',
                            position: 'relative',
                            transition: 'background-color 0.2s'
                        }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: showPastPrograms ? '18px' : '2px',
                                transition: 'left 0.2s'
                            }} />
                        </div>
                        <span style={{
                            fontSize: '14px',
                            color: '#424242'
                        }}>
                            Show Past Programs
                        </span>
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div style={{ 
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                }}>
                    Loading programs...
                </div>
            )}
            
            {/* Error state */}
            {error && (
                <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#d32f2f',
                    backgroundColor: '#ffebee',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && getFilteredPrograms().length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px'
                }}>
                    No programs found matching your criteria.
                </div>
            )}

            {/* Program grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                padding: '10px'
            }}>
                {getFilteredPrograms().map(program => (
                    <ProgramCard key={program.id} program={program} />
                ))}
            </div>
        </div>
    );
};

export default ProgramBrowser;
