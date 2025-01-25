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
    const [programs, setPrograms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [showPastPrograms, setShowPastPrograms] = useState(false);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/programs/', {
                    params: { search: searchTerm }
                });

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

    const getFilteredPrograms = () => {
        const today = new Date();
        
        return programs.filter(program => {
            const openDate = new Date(program.application_open_date);
            const deadline = new Date(program.application_deadline);

            if (!showPastPrograms && today > deadline) {
                return false;
            }

            switch (filter) {
                case 'open':
                    return today >= openDate && today <= deadline;
                case 'applied':
                    return program.applicationStatus && program.applicationStatus.toLowerCase() === 'applied';
                case 'enrolled':
                    return program.applicationStatus && program.applicationStatus.toLowerCase() === 'enrolled';
                case 'all':
                default:
                    return true;
            }
        });
    };

    const FilterButton = ({ label, value }) => (
        <button
            onClick={() => setFilter(value)}
            style={{
                padding: '8px 16px',
                backgroundColor: filter === value ? '#1a237e' : 'white',
                color: filter === value ? 'white' : '#1a237e',
                border: `1px solid ${filter === value ? '#1a237e' : '#ddd'}`,
                borderRadius: '20px',
                cursor: 'pointer',
                margin: '0 8px',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                fontWeight: filter === value ? '500' : 'normal',
                '&:hover': {
                    backgroundColor: filter === value ? '#1a237e' : '#f5f5f5'
                }
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ padding: '20px' }}>
            {/* Search and Filter Section */}
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '24px'
            }}>
                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    maxWidth: '600px',
                    margin: '0 auto 20px'
                }}>
                    <input
                        type="text"
                        placeholder="Search programs by name, location, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 48px 12px 48px',
                            fontSize: '1rem',
                            border: '2px solid #e0e0e0',
                            borderRadius: '25px',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            '&:focus': {
                                borderColor: '#1a237e',
                                boxShadow: '0 0 0 3px rgba(26,35,126,0.1)'
                            }
                        }}
                    />
                    <span style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                        fontSize: '1.2rem',
                        pointerEvents: 'none'
                    }}>
                        🔍
                    </span>
                </div>

                {/* Filter Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <FilterButton label="All Programs" value="all" />
                    <FilterButton label="Currently Open" value="open" />
                    <FilterButton label="Applied" value="applied" />
                    <FilterButton label="Enrolled" value="enrolled" />
                    <button
                        onClick={() => setShowPastPrograms(!showPastPrograms)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: showPastPrograms ? '#f5f5f5' : 'white',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            margin: '0 8px',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <span style={{
                            display: 'inline-block',
                            width: '16px',
                            height: '16px',
                            border: '1px solid #666',
                            borderRadius: '3px',
                            backgroundColor: showPastPrograms ? '#666' : 'transparent'
                        }} />
                        Show Past Programs
                    </button>
                </div>
            </div>

            {/* Programs Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    Loading programs...
                </div>
            ) : error ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#f44336'
                }}>
                    {error}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '24px',
                    padding: '20px 0',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {getFilteredPrograms().map(program => (
                        <ProgramCard 
                            key={program.id} 
                            program={program}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProgramBrowser;
