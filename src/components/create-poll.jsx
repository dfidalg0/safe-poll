// Componentes da Material UI
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, TextField, InputLabel,
    Select, MenuItem, Grid,
    Button, IconButton,
    Switch, CircularProgress
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

// Lodash <3
import reduce from 'lodash.reduce';

export default function CreatePoll({ open, onClose }){
    // Styles
    const theme = useTheme();
    const classes = useStyles();

    // Ref para a caixa de texto de opção nova (usada para autofocus)
    const newOptionRef = useRef();

    // Checagem de tamanho da tela para definir a variante do datepicker
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    // Estado de carregamento do envio do formulário
    const [loading, setLoading] = useState(false);

    // Dados de formulário a serem enviados para o backend
    const [title, setTitle] = useState('');
    const [description, setDesc] = useState('');
    const [type, setType] = useState(1);
    const [deadline, setDeadline] = useState(null);
    const [options, setOptions] = useState([]);
    const [secret_vote, setSecretVote] = useState(true);

    // Dado da nova opção de voto a ser adicionada
    const [newOption, setNewOption] = useState('');

    // Estado de erros de validação das opções (a.k.a. opções iguais)
    const [optionErrors, setOptionErrors] = useState([]);
    const [newOptionError, setNewOptionError] = useState(false);

    // Estado de erro de preenchimento da deadline
    const deadlineError = useMemo(() => {
        const n = Number(deadline);

        return deadline && (
            !(deadline instanceof Date) ||
            n <= Date.now() ||
            Number.isNaN(n)
        );
    }, [deadline]);

    // Limpeza do formulário
    const clear = () => {
        // Limpando dados do formulário
        setTitle('');
        setDesc('');
        setType(1);
        setDeadline(null);
        setOptions([]);
        setSecretVote(true);
        // Limpando erros
        setOptionErrors([]);
        setNewOptionError(false);
    };

    // Atualização de erro nas opções
    useEffect(() => {
        // Contagem do número de vezes em que cada opção ocorre
        const counters = reduce(options, (res, val, index) => {
            if (!res[val]) res[val] = [];
            res[val].push(index);

            return res;
        }, {});

        const errors = [];

        // Estado de erro para as opções que se repetem
        for (const key in counters){
            if (counters[key].length > 1){
                counters[key].forEach(index => errors[index] = true);
            }
        }

        // Mudança de estado
        setOptionErrors(errors);
    }, [options]);

    // Atualização de erro na nova opção
    useEffect(() => {
        setNewOptionError(options.includes(newOption));
    }, [newOption, options]);

    const hasErrors = useMemo(() => (
        options.length < 2 ||
        !title || !description || !deadline ||
        !optionErrors.every(el => !el) || deadlineError
    ), [options, title, description, optionErrors, deadline, deadlineError]);

    const submit = useCallback(async () => {
        const data = {
            title, description, type, deadline, options, secret_vote
        }

        // Estado de carregamento do envio
        setLoading(true);

        // TODO : Substituir console.log por um request para a API
        // Simulação do tempo de envio (para visualização do loading)
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(data);

        // Fim do estado de carregamento do envio
        setLoading(false);

        if(onClose) onClose();
        clear();
    }, [title, description, type, deadline, options, secret_vote, onClose]);

    // Criação de nova opção
    const createOption = useCallback(() => {
        // Inserção da nova opção na lista de opções (caso não esteja repetida)
        if (newOption && !newOptionError){
            setOptions(options => [...options, newOption]);
            setNewOption('');
        }
    }, [newOptionError, newOption]);

    // Deleção de opções
    const deleteOption = useCallback(index => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    }, [options]);

    // Atualização de uma opção
    const updateOption = useCallback((index, value) => {
        // Se não há nada escrito na opção, ela será deletada
        if (!value){
            deleteOption(index);
            // Foco do teclado no campo de digitação de opção nova
            newOptionRef.current.focus();
        }
        // Caso contrário, o novo valor desta deve ser inserido ao estado
        else {
            setOptions(options => {
                const newOptions = [...options];
                newOptions[index] = value;
                return newOptions;
            });
        }
    }, [deleteOption]);

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
                                value={description}
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
                    <Grid container alignItems="center">
                        <Switch id="secret" checked={secret_vote} onChange={e => setSecretVote(e.target.checked)}/>
                        <InputLabel htmlFor="secret">
                            Voto secreto
                        </InputLabel>
                    </Grid>
                    <Grid container justify="flex-end">
                        {loading ? <Button
                            className={classes.loadingButton}
                            disabled={true}
                        >
                            <CircularProgress
                                size={20}
                            />
                        </Button> : <Button
                            className={classes.button}
                            endIcon={<AddIcon />}
                            onClick={submit}
                            disabled={hasErrors}
                        >
                            Criar
                        </Button>}
                    </Grid>
                </DialogActions>
            </Grid>
        </Grid>
    </Dialog>
}
