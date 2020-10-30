import { useState, useEffect } from 'react';

import axios from 'axios';

export default function Display(){
    const [message, setMessage] = useState('Carregando...');

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await axios.get('/api/hello');

            setMessage(data.message);
        }

        setInterval(fetchData, 1000);
    }, []);

    return <p>
        { message } <br/>
    </p>
}
