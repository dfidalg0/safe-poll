import LoginSignUp from '@/components/loginSignUp';
import Bar from '@/components/Bar';

import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    margin: '64px 0px 0px 0px',
    minHeight: 'calc(100vh - 64px)'
  },
  panel: {
    [theme.breakpoints.up('md')]: {
      margin: '30px 0px 100px 0px'
    },
    margin: `10px 0px 10px 0px`,
  }
}));

export default function Login() {
  const classes = useStyles();

  return (
    <>
      <Bar />
      <Grid container justify='center' className={classes.container} alignItems='center'>
        <Grid item className={classes.panel}>
          <LoginSignUp />
        </Grid>
      </Grid>
    </>
  );
}
