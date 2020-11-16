import { useState, useEffect } from 'react';

import axios from 'axios';

export default function Display(){
    const [message, setMessage] = useState('Carregando...');

    useEffect(() => {
        const fetchData = async () => {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${localStorage.getItem('access')}`,
                    'Accept': 'application/json'
                }
            };

            try {
                const { data } = await axios.get('/api/hello', config);
                setMessage(data.message);
            } catch (err) {
                setMessage('Carregando...')
            }
        }

        fetchData();
    }, []);

    return <p>
        { message } <br/>
    </p>
}
