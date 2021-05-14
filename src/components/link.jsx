import { Link as NativeLink } from 'react-router-dom';
import { Link as MUILink } from '@material-ui/core';

/**
 * @param {Omit<Parameters<typeof MUILink>[0], 'component'>} props
 */
export default function Link(props) {
    return  <MUILink {...props} component={NativeLink} />;
}
