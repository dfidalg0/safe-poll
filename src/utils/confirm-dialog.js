import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import mitt from 'mitt';

import { notify } from '@/store/actions/ui';

import { useDispatch } from 'react-redux';
import { createContext } from 'react';
import { useContext, useState, useCallback } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

const ConfirmContext = createContext(async (message = '') => false);

export function useConfirm() {
  return useContext(ConfirmContext);
}

const evt = mitt();

const useStyles = makeStyles({
  yes: {
    backgroundColor: '#e47259',
    '&:hover': {
      backgroundColor: '#631d0e',
    },
    color: 'white',
  },
  no: {
    backgroundColor: '#30ceaf',
    '&:hover': {
      backgroundColor: '#0b4e41',
    },
    color: 'white',
  },
  actions: {
    justifyContent: 'center',
  },
});

const messages = defineMessages({
  question: {
    id: 'confirm-dialog.question',
  },
  yes: {
    id: 'confirm-dialog.yes',
  },
  no: {
    id: 'confirm-dialog.no',
  },
  actionCanceled: {
    id: 'manage.action-canceled',
  },
});

function ConfirmationProvider({ children, intl }) {
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const confirm = useCallback(
    (message = '') => {
      setMessage(message);
      setOpen(true);

      return new Promise((resolve) => {
        const handler = (value) => {
          resolve(value);
          if (value === false) {
            dispatch(notify(intl.formatMessage(messages.actionCanceled)));
          }

          evt.off(handler);
          setOpen(false);
        };

        evt.on('select', handler);
      });
    },
    [dispatch, intl]
  );

  const classes = useStyles();

  return (
    <ConfirmContext.Provider value={confirm}>
      <Dialog open={open}>
        <DialogTitle>{intl.formatMessage(messages.question)}</DialogTitle>
        <DialogContent dividers>{message}</DialogContent>
        <DialogActions className={classes.actions}>
          <Button
            onClick={() => evt.emit('select', true)}
            className={classes.yes}
          >
            {intl.formatMessage(messages.yes)}
          </Button>
          <Button
            onClick={() => evt.emit('select', false)}
            className={classes.no}
          >
            {intl.formatMessage(messages.no)}
          </Button>
        </DialogActions>
      </Dialog>
      {children}
    </ConfirmContext.Provider>
  );
}

export default injectIntl(ConfirmationProvider);
