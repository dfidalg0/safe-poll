import classes from '@/styles/home.module.css';
import LoginSignUp from '@/components/loginSignUp'

export default function Home() {
    return (
        <div className={classes.app}>
            <header className={classes.header}>
                <p>
                    Seja bem vindo! <br/>
                </p>
                <LoginSignUp />
            </header>
        </div >
    );
};
