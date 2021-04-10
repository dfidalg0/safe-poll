import { useState, useEffect, useCallback, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  Grid,
  Typography,
  Button,
  Tooltip,
  IconButton,
  TablePagination,
} from '@material-ui/core';

import { Add as AddIcon, InfoOutlined as InfoIcon } from '@material-ui/icons';

import CreatePoll from '@/components/create-poll';

import { Link } from 'react-router-dom';

import { fetchUserPolls } from '@/store/actions/items';
import { useSelector, useDispatch } from 'react-redux';
import { LocaleContext } from './language-wrapper';

import { useTheme, useMediaQuery } from '@material-ui/core';
import { defineMessages, injectIntl } from 'react-intl';
import { format } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '90%',
    overflowX: 'hidden',
    marginBottom: '30px',
    fontSize: '12pt',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  paper: {
    padding: theme.spacing(1.5),
    textAlign: 'center',
    color: 'black',
    borderRadius: 0,
    backgroundColor: 'lightgray',
  },
  tableHead: {
    padding: theme.spacing(2),
    marginBottom: 2,
    textAlign: 'center',
    color: 'black',
    backgroundColor: 'lightslategray',
    borderRadius: 0,
  },
  link: {
    color: 'black',
  },
  createButton: {
    marginBottom: '10pt',
    marginRight: '20pt',
  },
  tooltip: {
    maxWidth: 'min(60vw, 400px)',
  },
}));

const messages = defineMessages({
  myElections: {
    id: 'manage.my-elections',
  },
  title: {
    id: 'manage.title',
  },
  deadline: {
    id: 'manage.deadline',
  },
  noneElections: {
    id: 'manage.none-elections',
  },
  create: {
    id: 'manage.create',
  },
});

function UserPolls({ intl }) {
  const classes = useStyles();

  const [page, setPage] = useState(0);

  const rowsPerPage = 9;

  const [createOpen, setCreateOpen] = useState(false);

  const handleChangePage = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const polls = useSelector((state) => state.items.polls);
  const languageContext = useContext(LocaleContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!polls) {
      dispatch(fetchUserPolls());
    }
  }, [polls, dispatch]);

  const [tooltip, setTooltip] = useState(0);

  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const FormRow = useCallback(
    ({ poll }) => {
      const deadline = new Date(Number(new Date(poll.deadline)) + 10800000);

      const twoDaysLeft = Number(deadline) - Date.now() < 2 * 24 * 3600 * 1000;

      const showDesc = !isDesktop ? tooltip === poll.id : undefined;

      return (
        <>
          <Grid item xs={5} sm={6}>
            <Typography noWrap className={classes.paper}>
              <Link to={'/manage/polls/' + poll.id} className={classes.link}>
                {poll.title}
              </Link>
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Tooltip
              title={poll.description}
              placement='left'
              arrow
              className={classes.tooltip}
              open={showDesc}
            >
              <IconButton onClick={() => setTooltip(showDesc ? 0 : poll.id)}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={6} sm={5}>
            <Typography
              className={classes.paper}
              style={{
                color: twoDaysLeft ? 'red' : undefined,
              }}
            >
              {format(
                deadline,
                languageContext.locale === 'pt-BR' ||
                  languageContext.locale === 'es-ES'
                  ? 'dd/MM/yyyy'
                  : 'MM/dd/yyyy'
              )}
            </Typography>
          </Grid>
        </>
      );
    },
    [classes, tooltip, isDesktop, languageContext]
  );

  return (
    <>
      <CreatePoll open={createOpen} onClose={() => setCreateOpen(false)} />
      <Typography variant='h6' style={{ color: '#b0b3b2' }}>
        {intl.formatMessage(messages.myElections)}
      </Typography>
      <div className={classes.root}>
        <Grid container spacing={0} style={{ backgroundColor: 'lightgray' }}>
          <Grid container item xs={12} spacing={0}>
            <>
              <Grid item xs={7}>
                <Paper className={classes.tableHead}>
                  {intl.formatMessage(messages.title)}
                </Paper>
              </Grid>
              <Grid item xs={5}>
                <Paper className={classes.tableHead}>
                  {intl.formatMessage(messages.deadline)}
                </Paper>
              </Grid>
            </>
          </Grid>
          {!polls || polls.length === 0 ? (
            <Grid container style={{ width: '100%', padding: 20 }}>
              <Typography
                style={{
                  textAlign: 'center',
                  color: 'black',
                  width: '100%',
                }}
              >
                {intl.formatMessage(messages.noneElections)}
              </Typography>
            </Grid>
          ) : (
            polls
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((poll, index) => (
                <Grid container item xs={12} spacing={0} key={index}>
                  <FormRow poll={poll} />
                </Grid>
              ))
          )}

          <Grid container justify='flex-end'>
            <Button
              onClick={() => setCreateOpen(true)}
              className={classes.createButton}
              endIcon={<AddIcon />}
            >
              {intl.formatMessage(messages.create)}
            </Button>
          </Grid>

          <TablePagination
            style={{
              textAlign: 'center',
              background: 'lightslategray',
              width: '100%',
            }}
            component='div'
            labelRowsPerPage=''
            count={polls ? polls.length : 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            rowsPerPageOptions={[]}
          />
        </Grid>
      </div>
    </>
  );
}

export default injectIntl(UserPolls);
