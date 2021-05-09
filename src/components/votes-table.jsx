import { useEffect, useState, useContext } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Paper,
  OutlinedInput,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Grid,
} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import { useSelector } from 'react-redux';
import axios from 'axios';

import VotesTableFilter from './votes-table-filter';
import { LocaleContext } from './language-wrapper';
import { defineMessages, injectIntl } from 'react-intl';

const columns = [
  {
    id: 'voter',
    alignRight: false,
  },
  {
    id: 'option',
    alignRight: true,
  },
];

const messages = defineMessages({
  searchEmail: {
    id: 'manage.poll.results.search-email',
  },
  candidate: {
    id: 'manage.poll.results.candidate',
  },
  email: {
    id: 'manage.email',
  },
});

function CustomizedTableHead(props) {
  const { order, orderBy, onRequestSort, intl } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === column.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : 'asc'}
              onClick={createSortHandler(column.id)}
            >
              {intl.formatMessage(
                columns.id === 'voter' ? messages.email : messages.candidate
              )}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function VotesTable({ poll_id, pollOptions, intl }) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('voter');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [emailFilterSearch, setEmailFilterSearch] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [optionsFilter, setOptionsFilter] = useState(
    new Set(pollOptions.map((op) => op.name))
  );

  const token = useSelector((state) => state.auth.access);
  const languageContext = useContext(LocaleContext);

  const handleRequestSort = (_, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  let emptyRows = Math.min(rowsPerPage - rows.length, total - rows.length);
  if (total === rows.length && total < 5) emptyRows = 5 - total;

  useEffect(() => {
    async function fetchRows() {
      try {
        const order_by = (order === 'asc' ? '' : '-') + orderBy;
        const result = await axios.post(
          `/api/votes/get/${poll_id}`,
          {
            optionsFilter: [...optionsFilter],
          },
          {
            params: {
              page: page + 1,
              perPage: rowsPerPage,
              orderBy: order_by,
              emailFilter,
            },
            headers: {
              Authorization: `JWT ${token}`,
            },
          }
        );
        setRows(result.data.votes);
        setTotal(result.data.total);
      } catch (err) {
        console.log(err);
      }
    }
    setLoading(true);
    fetchRows();
    setLoading(false);
  }, [
    page,
    rowsPerPage,
    poll_id,
    token,
    order,
    orderBy,
    emailFilter,
    optionsFilter,
  ]);

  return (
    <div>
      <Divider style={{ marginTop: '20px', marginBottom: '20px' }} />
      <Grid container>
        <Grid item xs={8}>
          <FormControl variant="outlined">
            <InputLabel htmlFor="search" size="small" margin="dense">
              {intl.formatMessage(messages.searchEmail)}
            </InputLabel>
            <OutlinedInput
              id="search"
              endAdornment={
                <>
                  <IconButton
                    onClick={() => {
                      setEmailFilter('');
                      setEmailFilterSearch('');
                    }}
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setEmailFilter(emailFilterSearch);
                      setOptionsFilter(
                        new Set(pollOptions.map((op) => op.name))
                      );
                      setPage(0);
                    }}
                    size="small"
                  >
                    <SearchIcon />
                  </IconButton>
                </>
              }
              labelWidth={languageContext.locale === 'es-ES' ? 190 : 100}
              value={emailFilterSearch}
              onChange={(event) => setEmailFilterSearch(event.target.value)}
              margin="dense"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <VotesTableFilter
            pollOptions={pollOptions}
            optionsFilter={optionsFilter}
            setOptionsFilter={setOptionsFilter}
            setPage={setPage}
          />
        </Grid>
      </Grid>
      <Paper>
        {loading ? (
          <CircularProgress size={18} />
        ) : (
          <>
            <TableContainer>
              <Table size="medium">
                <CustomizedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  rowCount={rows.length}
                  intl={intl}
                />

                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <TableRow hover key={index}>
                        <TableCell>{row.voter}</TableCell>
                        <TableCell align="right">{row.option}</TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </div>
  );
}

export default injectIntl(VotesTable);
