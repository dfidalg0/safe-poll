import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import axios from 'axios';

function Display({ token }){
    const [message, setMessage] = useState('Seja bem vindo!');

    useEffect(() => {
        const fetchData = async () => {
            setMessage('Carregando...');

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${token}`,
                    'Accept': 'application/json'
                }
            };

            try {
                const { data } = await axios.get('/api/hello', config);
                setMessage(data.message);
            }
            catch (err) {
                setMessage('Seja bem vindo!');
            }
        }

        if (token && (message === 'Seja bem vindo!'))
            fetchData();
        else if (!token)
            setMessage('Seja bem vindo!');
    }, [token, message]);

    return <p>
        { message } <br/>
    </p>
}

export default connect(
    state => ({
        token: state.auth.access
    })
)(Display);
