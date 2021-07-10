import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  root: {
    width: '500px',
    maxWidth: '100%'
  },
  input: {
    height: '50px'
  },
  field: {
    width: '100%',
    height: '50px',
    marginBottom: '20px'
  },
  option: {
    width: '100%',
    height: '40px',
    marginBottom: '20px'
  },
  description: {
    width: '87%',
    height: '40px',
    marginBottom: '20px',
    marginLeft: '50px'
  },
  button: {
    width: '100px',
    marginBottom: '5px',
    justifyContent: 'flex-end',
    paddingRight: '11px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.action.main,
      color: theme.palette.action.contrastText
    },
    '&:disabled': {
      backgroundColor: 'gray',
      color: 'white'
    }
  },
  loadingButton: {
    width: '100px'
  },
  deleteIcon: {
    color: '#900a0a'
  },
  closeButton: {
    float: 'right',
    marginTop: '-7pt'
  }
}));
