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
import { PageContainer, ContentContainer, SearchContainer, SearchInput, FilterButton, ProgramGrid } from './styled';
import SearchIcon from '@mui/icons-material/Search';

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

    return (
        <PageContainer>
            <ContentContainer>
                {/* Search and Filter Section */}
                <SearchContainer>
                    {/* Search Bar */}
                    <div style={{ position: 'relative' }}>
                        <SearchInput
                            fullWidth
                            placeholder="Search programs by name, location, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchIcon 
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#666',
                                fontSize: '1.2rem',
                                pointerEvents: 'none'
                            }}
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginTop: '20px'
                    }}>
                        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                            All Programs
                        </FilterButton>
                        <FilterButton active={filter === 'open'} onClick={() => setFilter('open')}>
                            Currently Open
                        </FilterButton>
                        <FilterButton active={filter === 'applied'} onClick={() => setFilter('applied')}>
                            Applied
                        </FilterButton>
                        <FilterButton active={filter === 'enrolled'} onClick={() => setFilter('enrolled')}>
                            Enrolled
                        </FilterButton>
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
                </SearchContainer>

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
                    <ProgramGrid>
                        {getFilteredPrograms().map(program => (
                            <ProgramCard 
                                key={program.id} 
                                program={program}
                            />
                        ))}
                    </ProgramGrid>
                )}
            </ContentContainer>
        </PageContainer>
    );
};

export default ProgramBrowser;
