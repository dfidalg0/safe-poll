import LoginSignUp from '@/components/loginSignUp'

import { Grid } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    container: {
        height: '100vh'
    }
});

export default function Home() {
    const classes = useStyles();

    return (
        <Grid container justify="center" alignContent="center"
            className={classes.container}
        >
            <LoginSignUp  />
        </Grid>
    );
};
