import { Grid, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserGroups } from '@/store/actions/items';
import { Route, Switch } from 'react-router-dom';
import { useEffect } from 'react';
import { getPath } from '@/utils/routes';

import Dashboard from './dashboard';
import EmailsGroup from './emailsGroup';
import Poll from './poll';
import Group from './group';

import Bar from '@/components/Bar';

const useStyles = makeStyles({
  panel: {
    margin: '104px 0px 30pt 0px',
  },
});

export default function Main() {
  const classes = useStyles();

  const dispatch = useDispatch();

  const groups = useSelector((state) => state.items.groups);

  useEffect(() => {
    if (!groups) {
      dispatch(fetchUserGroups());
    }
  }, [groups, dispatch]);

  return (
    <>
      <Bar />
      <Grid container justify='center' className={classes.panel}>
        <Switch>
          <Route exact path={getPath('manage')} component={Dashboard} />
          <Route exact path={getPath('newGroup')} component={EmailsGroup} />
          <Route exact path={getPath('poll')} component={Poll} />
          <Route exact path={getPath('group')} component={Group} />
        </Switch>
      </Grid>
    </>
  );
}
