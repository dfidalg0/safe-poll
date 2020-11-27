import classes from '../styles/home.module.css';
import Display from '../components/display';
import LoginSignUp from '../components/loginSignUp'

export default function Home() {
    return (
        <div className={classes.app}>
            <header className={classes.header}>
                <Display />
                <LoginSignUp />
            </header>
        </div >
    );
};
