import { Route, Redirect } from 'react-router-dom';

/**
 * @typedef {{
 *   component: import('react-router-dom').RouteProps['component'];
 *   condition: boolean;
 *   redirect: string;
 * } & import('react-router-dom').RouteProps} CondRouteProps
 */

/**
 * @param {CondRouteProps}
 */
export default function ContitionRoute({
    component: Component,
    condition,
    redirect,
    ...args
}){
    return <Route {...args}
        render={props => condition ?
            <Component {...props} /> :
            <Redirect to={redirect} />
        }
    />
}
