import { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  Grid,
  Typography,
  TablePagination,
  Button,
} from '@material-ui/core';

import { Add as AddIcon } from '@material-ui/icons';

import { fetchUserGroups } from '@/store/actions/items';
import { useSelector, useDispatch } from 'react-redux';

import { Link } from 'react-router-dom';
import { injectIntl, defineMessages } from 'react-intl';

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
}));

const messages = defineMessages({
  myGroups: {
    id: 'manage.my-groups',
  },
  name: {
    id: 'common-messages.name',
  },
  noneGroups: {
    id: 'manage.none-groups',
  },
  create: {
    id: 'manage.create',
  },
});

function UserGroups({ intl }) {
  const classes = useStyles();

  const [page, setPage] = useState(0);

  const rowsPerPage = 9;

  const handleChangePage = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const groups = useSelector((state) => state.items.groups);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!groups) {
      dispatch(fetchUserGroups());
    }
  }, [groups, dispatch]);

  const FormRow = useCallback(
    ({ group }) => {
      return (
        <Grid item xs={12}>
          <Typography noWrap className={classes.paper}>
            <Link to={'/manage/groups/' + group.id} className={classes.link}>
              {group.name}
            </Link>
          </Typography>
        </Grid>
      );
    },
    [classes]
  );

  return (
    <>
      <Typography variant='h6' style={{ color: '#b0b3b2' }}>
        &nbsp;&nbsp;&nbsp;{intl.formatMessage(messages.myGroups)}
        &nbsp;&nbsp;&nbsp;
      </Typography>
      <div className={classes.root}>
        <Grid container spacing={0} style={{ backgroundColor: 'lightgray' }}>
          <Grid container item xs={12} spacing={0}>
            <>
              <Grid item xs={12}>
                <Paper className={classes.tableHead}>
                  {intl.formatMessage(messages.name)}
                </Paper>
              </Grid>
            </>
          </Grid>
          {!groups || groups.length === 0 ? (
            <Grid container style={{ width: '100%', padding: 20 }}>
              <Typography
                style={{
                  textAlign: 'center',
                  color: 'black',
                  width: '100%',
                }}
              >
                {intl.formatMessage(messages.noneGroups)}
              </Typography>
            </Grid>
          ) : (
            groups
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((group, index) => (
                <Grid container item xs={12} spacing={0} key={index}>
                  <FormRow group={group} />
                </Grid>
              ))
          )}

          <Grid container justify='flex-end'>
            <Button
              component={Link}
              to='/manage/groups/new'
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
            count={groups ? groups.length : 0}
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

export default injectIntl(UserGroups);
