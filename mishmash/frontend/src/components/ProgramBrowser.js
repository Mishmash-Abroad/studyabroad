import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import ProgramCard from './ProgramCard';

const ProgramBrowser = () => {
    const [programs, setPrograms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/programs/', {
                    params: {
                        search: searchTerm
                    }
                });
                setPrograms(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching programs:', err);
                setError('Failed to load programs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        // Debounce search requests
        const timeoutId = setTimeout(fetchPrograms, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{ margin: 0 }}>Available Programs</h2>
                <div style={{ width: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search by title or faculty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '16px'
                        }}
                    />
                </div>
            </div>

            {loading && <div>Loading programs...</div>}
            
            {error && (
                <div style={{ color: 'red', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {!loading && !error && programs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    No programs found matching your search criteria.
                </div>
            )}

            <div>
                {programs.map(program => (
                    <ProgramCard key={program.id} program={program} />
                ))}
            </div>
        </div>
    );
};

export default ProgramBrowser;
