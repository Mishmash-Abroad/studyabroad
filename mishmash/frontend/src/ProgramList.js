import React, { useEffect, useState } from 'react';
import axios from 'axios';



// const ProgramList = () => {
//     const [programs, setPrograms] = useState([]);

//     useEffect(() => {
//         axios.get('/api/programs/').then(response => setPrograms(response.data));
//     }, []);

//     return (
//         <div>
//             <h1>Programs</h1>
//             <ul>
//                 {programs.map(program => (
//                     <li key={program.id}>{program.title}</li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default ProgramList;
