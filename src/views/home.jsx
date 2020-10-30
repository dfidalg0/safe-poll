import logo from '../assets/logo.svg';
import classes from '../styles/home.module.css';

import Display from '../components/display';

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
            </header>
        </div>
    );
}
