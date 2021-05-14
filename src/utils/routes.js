import { join } from 'path';

const manage = createRoot('/manage');

const routes = {
    home: '/',
    login: '/login',
    resetPassword: '/reset-password',
    confirmResetPassword: '/password/reset/confirm/:uid/:token',
    vote: '/polls/:uid/vote',
    manage: manage(),
    newGroup: manage('/group/new'),
    poll: manage('/poll/:uid'),
    group: manage('/group/:uid')
};

/**
 * @param {string} root
 * @returns {(path: string) => string}
 */
function createRoot(root) {
    return path => join(root, path || '');
}

/**
 * @param {keyof typeof routes} name
 * @param {Record<string, string | number>=} params
 */
export function getPath(name, params) {
    let route = routes[name];

    if (params) {
        for (const [param, value] of Object.entries(params)) {
            route = route.replace(`:${param}`, value);
        }
    }

    return route;
}
