import logo from './logo.svg';
import './App.css';

import { useState, useEffect } from 'react';

import axios from 'axios';

function App() {
    const [message, setMessage] = useState('Carregando...');

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await axios.get('/api/hello');

            setMessage(data.message);
        }

        setInterval(() => {
            fetchData();
        }, 1000);
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    { message } <br />
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
