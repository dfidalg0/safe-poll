import LoginSignUp from '@/components/loginSignUp';

import { Grid } from '@material-ui/core';
import { LocaleSelector } from '../components/language-wrapper';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  container: {
    height: '80vh',
  },
});

export default function Login() {
  const classes = useStyles();

  return (
    <>
      <LocaleSelector />
      <Grid
        container
        justify='center'
        alignContent='center'
        className={classes.container}
      >
        <LoginSignUp />
      </Grid>
    </>
  );
}
