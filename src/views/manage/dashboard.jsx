import { Grid } from '@material-ui/core';

import UserPolls from '@/components/user-polls';
import UserGroups from '@/components/user-groups';

export default function Dashboard() {
  return (
    <Grid container>
      <Grid item xs={12} md={6}>
        <Grid container justify='center'>
          <UserPolls />
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <Grid container justify='center'>
          <UserGroups />
        </Grid>
      </Grid>
    </Grid>
  );
}
