import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
    root: {
        width: 500,
        maxWidth: '90vw',
        justifyContent: 'center',
        textAlign: 'center'
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    paper: {
        height: '100%',
        verticalAlign: 'middle',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    deleteIcon: {
        color: '#900a0a',
    },
    checkIcon: {
        color: '#1b5e20'
    },
    emailIcon: {
        color: '#37474f'
    }
});
