import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  root: {
    width: '500px',
    maxWidth: '98%',
    justifyContent: 'center',
    textAlign: 'center'
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  paper: {
    height: '100%',
    verticalAlign: 'middle',
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  deleteIcon: {
    color: '#900a0a',
  },
  checkIcon: {
    color: '#1b5e20'
  },
  emailIcon: {
    color: theme.palette.primary.main
  }
}));
