import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  makeStyles
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles({
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  title: {
    fontWeight: 'bold'
  }
});

/**
 * @param {string} title
 */
export default function Expansion({ title, children }) {
  const classes = useStyles();

  return <ExpansionPanel>
    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
      <Typography clasName={classes.title}>{title}</Typography>
    </ExpansionPanelSummary>

    <ExpansionPanelDetails className={classes.center}>
      {children}
    </ExpansionPanelDetails>
  </ExpansionPanel>
}
