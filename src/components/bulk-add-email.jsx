// Componentes da Material UI
import { Button, Grid, Divider } from '@material-ui/core';
import isEmail from 'validator/lib/isEmail';
import csv from 'csv';
import { notify } from '@/store/actions/ui';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  description: {
    id: 'manage.poll.bulk-add-email.description',
  },
  buttonLabel: {
    id: 'manage.poll.bulk-add-email.button-label',
  },
  messageSuccess: {
    id: 'manage.poll.bulk-add-email.success',
  },
  genericError: {
    id: 'error.generic',
  },
});

function BulkAddEmail({ emails, setEmails, intl }) {
  const dispatch = useDispatch();

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      csv.parse(reader.result, (err, data) => {
        let newEmails = [];
        data.forEach((line) => {
          line.forEach((d) => {
            if (isEmail(d) && !emails.includes(d)) newEmails.push(d);
          });
        });
        setEmails((emails) => [...emails, ...newEmails]);
      });
    };
    try {
      reader.readAsBinaryString(file);
      dispatch(notify(intl.formatMessage(messages.messageSuccess), 'success'));
    } catch (err) {
      dispatch(notify(intl.formatMessage(messages.genericError), 'error'));
    }
  };
  return (
    <>
      <Grid container justify="center">
        <Grid item xs={12} style={{ marginBottom: '20px' }}>
          {intl.formatMessage(messages.description)}
        </Grid>
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button variant="contained" component="label">
            {intl.formatMessage(messages.buttonLabel)}
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => {
                handleFile(e.target.files[0]);
              }}
            />
          </Button>
        </Grid>
      </Grid>
      <Divider style={{ marginTop: '20px', marginBottom: '20px' }} />
    </>
  );
}

export default injectIntl(BulkAddEmail);
