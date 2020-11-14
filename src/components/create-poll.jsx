// Componentes da Material UI
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, TextField, InputLabel,
    Select, MenuItem, Grid,
    Button, IconButton
} from '@material-ui/core';

// Ícones
import {
    DeleteOutline as DeleteIcon,
    Add as AddIcon
} from '@material-ui/icons';

// Date Picker
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

// Constantes
import { POLL_TYPES } from '../utils/constants';

// Hooks
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { useStyles } from '../styles/create-poll';

import reduce from 'lodash.reduce';

export default function CreatePoll({ show, onClose }){
    const theme = useTheme();
    const classes = useStyles();

    const newOptionRef = useRef();

    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    const [open, setOpen] = useState(show);

    useEffect(() => {
        setOpen(show);
    }, [show]);

    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState(1);
    const [deadline, setDeadline] = useState(null);
    const [options, setOptions] = useState([]);
    const [newOption, setNewOption] = useState('');

    const clear = () => {
        setTitle('');
        setDesc('');
        setType(1);
        setDeadline(null);
        setOptions([]);
        setNewOptionError('');
    };

    const [optionErrors, setOptionErrors] = useState([]);
    const [newOptionError, setNewOptionError] = useState(false);

    const deadlineError = useMemo(() => {
        const n = Number(deadline);

        return deadline && (
            n <= Date.now() ||
            Number.isNaN(n)
        );
    }, [deadline]);

    useEffect(() => {
        const counters = reduce(options, (res, val, index) => {
            if (!res[val]) res[val] = [];
            res[val].push(index);

            return res;
        }, {});

        const errors = [];

        for (const key in counters){
            if (counters[key].length > 1){
                counters[key].forEach(index => errors[index] = true);
            }
        }

        setOptionErrors(errors);
    }, [options]);

    const hasErrors = useMemo(() => (
        options.length < 2 ||
        !optionErrors.every(el => !el) ||
        !title || !desc || deadlineError
    ), [options, optionErrors, title, desc, deadlineError]);

    useEffect(() => {
        setNewOptionError(options.includes(newOption));
    }, [newOption, options]);

    const submit = useCallback(async () => {
        const data = {
            title, desc, type, deadline, options
        }

        console.log(data);

        setOpen(false);
        onClose();
        clear();
    }, [title, desc, type, deadline, options, onClose]);

    const deleteOption = useCallback(index => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    }, [options]);

    const updateOption = useCallback((index, value) => {
        if (!value){
            deleteOption(index);
            newOptionRef.current.focus();
        }
        else {
            setOptions(options => {
                const newOptions = [...options];
                newOptions[index] = value;
                return newOptions;
            });
        }
    }, [deleteOption]);

    const createOption = useCallback(() => {
        if (newOption && !newOptionError){
            setOptions(options => [...options, newOption]);
            setNewOption('');
        }
    }, [newOptionError, newOption]);

    return <Dialog open={open} onClose={() => {
        if(onClose) onClose();
    }}>
        <Grid container className={classes.root} justify="center">
            <Grid item xs={12}>
                <DialogTitle>
                    Criar Eleição
                </DialogTitle>
                <Divider />
            </Grid>
            <Grid item xs={12}>
                <DialogContent>
                    <Grid container>
                        <Grid item xs={12}>
                            <InputLabel htmlFor="title">
                                Título
                            </InputLabel>
                            <TextField id="title"
                                autoComplete="off"
                                className={classes.field}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                variant="outlined"
                                margin="normal"
                                required
                                autoFocus
                                InputProps={{
                                    className: classes.input
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <InputLabel htmlFor="description">
                                Descrição
                            </InputLabel>
                            <TextField id="description"
                                autoComplete="off"
                                className={classes.field}
                                multiline
                                required
                                variant="outlined"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                InputProps={{
                                    className: classes.input
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <InputLabel htmlFor="type">
                                Modalidade
                            </InputLabel>
                            <Select id="type"
                                className={classes.field}
                                required
                                value={type}
                                variant="outlined"
                                onChange={e => setType(e.target.value)}
                            >
                                {POLL_TYPES.map((type, index) =>
                                    <MenuItem value={index+1} key={index}>
                                        {type}
                                    </MenuItem>
                                )}
                            </Select>
                        </Grid>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="deadline">
                                    Prazo final da votação
                                </InputLabel>
                                <KeyboardDatePicker id="deadline"
                                    error={deadlineError}
                                    autoComplete="off"
                                    value={deadline}
                                    className={classes.field}
                                    variant={isDesktop ? 'inline' : 'dialog'}
                                    onChange={date => setDeadline(date)}
                                    format="dd/MM/yyyy"
                                    inputVariant="outlined"
                                    InputProps={{
                                        className: classes.input
                                    }}
                                    invalidDateMessage="Formato de data inválido"
                                />
                            </Grid>
                        </MuiPickersUtilsProvider>
                        <Grid item xs={12}>
                            <InputLabel>
                                Candidatos
                            </InputLabel>
                            { options.map((option, index) =>
                                <Grid container key={index}>
                                    <Grid item xs={10}>
                                        <TextField
                                            autoComplete="off"
                                            className={classes.option}
                                            variant="outlined"
                                            value={option}
                                            error={optionErrors[index]}
                                            onChange={e => updateOption(index, e.target.value)}
                                            InputProps={{
                                                className: classes.input
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <IconButton onClick={
                                            () => deleteOption(index)
                                        }>
                                            <DeleteIcon className={classes.deleteIcon}/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            )}
                            <Grid container>
                                <Grid item xs={10}>
                                    <TextField
                                        autoComplete="off"
                                        inputRef={newOptionRef}
                                        className={classes.option}
                                        variant="outlined"
                                        value={newOption}
                                        error={newOptionError}
                                        onChange={e => setNewOption(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') createOption();
                                        }}
                                        InputProps={{
                                            className: classes.input
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton onClick={createOption}>
                                        <AddIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Grid container justify="flex-end">
                        <Button
                            className={classes.button}
                            endIcon={<AddIcon />}
                            onClick={submit}
                            disabled={hasErrors}
                        >
                            Criar
                        </Button>
                    </Grid>
                </DialogActions>
            </Grid>
        </Grid>
    </Dialog>
}
