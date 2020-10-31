import logo from '../assets/logo.svg';
import classes from '../styles/home.module.css';
import { Button } from '@material-ui/core';
import Display from '../components/display';
import { link } from 'react-router-dom';

export default function Home() {
    return (
        <div className={classes.app}>
            <header className={classes.header}>
                <img src={logo} className={classes.logo} alt="logo" />
                <Display />
                <a
                    className={classes.link}
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
                <Button
                    variant="contained" color="primary"
                    size="large"
                    className={classes.button}
                >
                    <Link to="/login">Cadastre-se</Link>
            </Button>
            </header>
            <body>

            </body>

        </div >
    );
}
