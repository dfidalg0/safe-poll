import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Typography,
  Checkbox,
  Button,
} from '@material-ui/core';

import FilterListIcon from '@material-ui/icons/FilterList';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  apply: {
    id: 'manage.poll.results.filter.apply',
  },
  candidates: {
    id: 'manage.create-poll.candidates',
  },
});

function VotesTableFilter({
  optionsFilter,
  setOptionsFilter,
  pollOptions,
  setPage,
  intl,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [selected, setSelected] = useState(new Set(optionsFilter));

  const handleCheckboxChange = (op) => {
    let newSet = selected;
    if (selected.has(op)) {
      newSet.delete(op);
    } else {
      newSet.add(op);
    }
    setSelected(new Set([...newSet]));
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid container>
      <Grid item xs={8}>
        <Typography
          variant="body1"
          display="block"
          style={{ padding: '10px', float: 'right' }}
        >
          {intl.formatMessage(messages.candidates)}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <FilterListIcon />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: 48 * 4.5,
              width: '20ch',
            },
          }}
        >
          {pollOptions.map((option) => (
            <MenuItem key={option.name}>
              <Grid container alignContent="center" alignItems="center">
                <Grid item>
                  <Checkbox
                    checked={selected.has(option.name)}
                    onChange={() => handleCheckboxChange(option.name)}
                    value={option.name}
                  />
                </Grid>
                <Grid item>{option.name}</Grid>
              </Grid>
            </MenuItem>
          ))}
          <Button
            style={{
              width: '100%',
            }}
            onClick={() => {
              setPage(0);
              setOptionsFilter(selected);
              handleClose();
            }}
          >
            {intl.formatMessage(messages.apply)}
          </Button>
        </Menu>
      </Grid>
    </Grid>
  );
}

export default injectIntl(VotesTableFilter);
