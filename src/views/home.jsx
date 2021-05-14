import {
  useHistory
} from 'react-router-dom';

import {
  Button, Grid
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import { getPath } from '@/utils/routes';

const useStyles = makeStyles((theme) => ({
  grid: {
    height: '100vh'
  },
  button: {
    marginRight: 5,
    marginTop: '10px',
    marginBottom: '10px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    },
  }
}));

export default function Home() {
  const router = useHistory();

  const classes = useStyles();

  return <>
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      className={classes.grid}
    >
      <Grid item>
        <Button onClick={() => router.replace(getPath('login'))} className={classes.button}>
          Get Started
        </Button>
      </Grid>
    </Grid>
  </>
};
