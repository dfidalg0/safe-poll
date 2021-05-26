import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  typography: {
    color: 'black',
  },
  breadcrumb: {
    marginTop: '20px',
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    color: 'black',
  },
  progress: {
    marginTop: '-51px',
  },
  language: {
    display: 'flex',
    float: 'right',
  },
  alert: {
    marginBottom: '30px',
    marginTop: '-20px',
  },
  description: {
    marginTop: '-5px',
    marginBottom: '10px',
    marginLeft: '50px',
    color: '#3e424c',
    fontSize: '13px',
  },
}));
