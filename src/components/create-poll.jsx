// Componentes da Material UI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  IconButton,
  Switch,
  CircularProgress,
} from '@material-ui/core';

// Ícones
import {
  DeleteOutline as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@material-ui/icons';

// Date Picker
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

// Constantes
import { POLL_TYPES } from '@/utils/constants';

// Hooks
import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from 'react';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { useStyles } from '@/styles/create-poll';

import { pushPoll } from '@/store/actions/items';
import { notify } from '@/store/actions/ui';
import { useDispatch, useSelector } from 'react-redux';

// Lodash <3
import reduce from 'lodash.reduce';

import axios from 'axios';
import { defineMessages, injectIntl } from 'react-intl';
import { LocaleContext } from './language-wrapper';

const messages = defineMessages({
  createElectionSuccess: {
    id: 'manage.create-poll.success',
  },
  creteElection: {
    id: 'manage.create-poll.create-button',
  },
  title: {
    id: 'manage.title',
  },
  description: {
    id: 'manage.description',
  },
  type: {
    id: 'manage.create-poll.type',
  },
  votes_number: {
    id: 'manage.create-poll.votes_number',
  },
  deadline: {
    id: 'manage.create-poll.deadline',
  },
  invalidDate: {
    id: 'manage.create-poll.invalid-deadline',
  },
  create: {
    id: 'manage.create',
  },
  candidates: {
    id: 'manage.create-poll.candidates',
  },
  secretVote: {
    id: 'manage.create-poll.secretVote',
  },
  internalServerError: {
    id: 'error.internal-server',
  },
  invalidFormError: {
    id: 'error.invalid-form',
  },
  genericError: {
    id: 'error.generic',
  },
});

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 * }}
 */
function CreatePoll({ open, onClose, intl }) {
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
  const [type_id, setType] = useState(1);
  const [votes_number, setVotesNumber] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [options, setOptions] = useState([]);
  const [secret_vote, setSecretVote] = useState(true);

  // Dado da nova opção de voto a ser adicionada
  const [newOption, setNewOption] = useState('');

  // Estado de erros de validação das opções (a.k.a. opções iguais)
  const [optionErrors, setOptionErrors] = useState([]);
  const [newOptionError, setNewOptionError] = useState(false);

  const languageContext = useContext(LocaleContext);

  // Estado de erro de preenchimento da deadline
  const deadlineError = useMemo(() => {
    const n = Number(deadline);

    return (
      deadline &&
      (!(deadline instanceof Date) || n <= Date.now() || Number.isNaN(n))
    );
  }, [deadline]);

  // Limpeza do formulário
  const clear = useCallback(() => {
    // Limpando dados do formulário
    setTitle('');
    setDesc('');
    setType(1);
    setVotesNumber('');
    setDeadline(null);
    setOptions([]);
    setSecretVote(true);
    // Limpando erros
    setOptionErrors([]);
    setNewOptionError(false);
  }, []);

  // Atualização de erro nas opções
  useEffect(() => {
    // Contagem do número de vezes em que cada opção ocorre
    const counters = reduce(
      options,
      (res, val, index) => {
        if (!res[val]) res[val] = [];
        res[val].push(index);

        return res;
      },
      {}
    );

    const errors = [];

    // Estado de erro para as opções que se repetem
    for (const key in counters) {
      if (counters[key].length > 1) {
        counters[key].forEach((index) => (errors[index] = true));
      }
    }

    // Mudança de estado
    setOptionErrors(errors);
  }, [options]);

  // Atualização de erro na nova opção
  useEffect(() => {
    setNewOptionError(options.includes(newOption));
  }, [newOption, options]);

  const hasErrors = useMemo(
    () =>
      options.length < 2 ||
      !title ||
      !description ||
      !deadline ||
      !optionErrors.every((el) => !el) ||
      deadlineError,
    [options, title, description, optionErrors, deadline, deadlineError]
  );

  const token = useSelector((state) => state.auth.access);

  const dispatch = useDispatch();

  const submit = useCallback(async () => {
    const data = {
      title,
      description,
      type_id,
      votes_number,
      deadline: deadline.toJSON().slice(0, 10),
      options,
      secret_vote,
    };
    if( data.type_id === 3 )
      data.votes_number = Number(data.votes_number);
    else
      data.votes_number = 1;

    // Estado de carregamento do envio
    setLoading(true);

    try {
      const res = await axios.post('/api/polls/create', data, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });

      if (onClose) onClose();
      clear();

      dispatch(
        notify(intl.formatMessage(messages.createElectionSuccess), 'success')
      );

      dispatch(pushPoll(res.data));
    } catch ({ response: { status } }) {
      let info;
      if (status === 500) {
        info = messages.internalServerError;
      } else if (status === 422) {
        info = messages.invalidFormError;
      } else {
        info = messages.genericError;
      }
      dispatch(notify(intl.formatMessage(info), 'error'));
    }

    // Fim do estado de carregamento do envio
    setLoading(false);
  }, [
    title,
    description,
    type_id,
    votes_number,
    deadline,
    options,
    secret_vote,
    onClose,
    token,
    dispatch,
    clear,
    intl,
  ]);

  // Criação de nova opção
  const createOption = useCallback(() => {
    // Inserção da nova opção na lista de opções (caso não esteja repetida)
    if (newOption && !newOptionError) {
      setOptions((options) => [...options, newOption]);
      setNewOption('');
    }
  }, [newOptionError, newOption]);

  // Deleção de opções
  const deleteOption = useCallback(
    (index) => {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    },
    [options]
  );

  // Atualização de uma opção
  const updateOption = useCallback(
    (index, value) => {
      // Se não há nada escrito na opção, ela será deletada
      if (!value) {
        deleteOption(index);
        // Foco do teclado no campo de digitação de opção nova
        newOptionRef.current.focus();
      }
      // Caso contrário, o novo valor desta deve ser inserido ao estado
      else {
        setOptions((options) => {
          const newOptions = [...options];
          newOptions[index] = value;
          return newOptions;
        });
      }
    },
    [deleteOption]
  );

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (onClose) onClose();
      }}
    >
      <Grid container className={classes.root} justify='center'>
        <Grid item xs={12}>
          <DialogTitle>
            {intl.formatMessage(messages.creteElection)}
            <IconButton
              className={classes.closeButton}
              onClick={onClose ? onClose : null}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <DialogContent>
            <Grid container>
              <Grid item xs={12}>
                <InputLabel htmlFor='title'>
                  {intl.formatMessage(messages.title)}
                </InputLabel>
                <TextField
                  id='title'
                  autoComplete='off'
                  className={classes.field}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant='outlined'
                  margin='normal'
                  required
                  autoFocus
                  InputProps={{
                    className: classes.input,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel htmlFor='description'>
                  {intl.formatMessage(messages.description)}
                </InputLabel>
                <TextField
                  id='description'
                  autoComplete='off'
                  className={classes.field}
                  multiline
                  required
                  variant='outlined'
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  InputProps={{
                    className: classes.input,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel htmlFor='type'>
                  {intl.formatMessage(messages.type)}
                </InputLabel>
                <Select
                  id='type'
                  className={classes.field}
                  required
                  value={type_id}
                  variant='outlined'
                  onChange={(e) => setType(e.target.value)}
                >
                  {POLL_TYPES.map((type, index) => (
                    <MenuItem value={index + 1} key={index}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              { type_id === 3 && (
                <Grid item xs={12}>
                <InputLabel htmlFor='votes_number'>
                  {intl.formatMessage(messages.votes_number)}
                </InputLabel>
                <TextField
                  id='votes_number'
                  autoComplete='off'
                  className={classes.field}
                  multiline
                  required
                  variant='outlined'
                  value={votes_number}
                  onChange={(e) => setVotesNumber(e.target.value)}
                  InputProps={{
                    className: classes.input,
                  }}
                />
              </Grid>
              )}
                

              
              <MuiPickersUtilsProvider
                utils={DateFnsUtils}
                locale={languageContext.dateLocale}
              >
                <Grid item xs={12}>
                  <InputLabel htmlFor='deadline'>
                    {intl.formatMessage(messages.deadline)}
                  </InputLabel>
                  <KeyboardDatePicker
                    id='deadline'
                    error={deadlineError}
                    autoComplete='off'
                    value={deadline}
                    className={classes.field}
                    variant={isDesktop ? 'inline' : 'dialog'}
                    onChange={(date) => setDeadline(date)}
                    inputVariant='outlined'
                    InputProps={{
                      className: classes.input,
                    }}
                    invalidDateMessage={intl.formatMessage(
                      messages.invalidDate
                    )}
                    format={
                      languageContext.locale === 'pt-BR' ||
                      languageContext.locale === 'es-ES'
                        ? 'dd/MM/yyyy'
                        : 'MM/dd/yyyy'
                    }
                  />
                </Grid>
              </MuiPickersUtilsProvider>
              <Grid item xs={12}>
                <InputLabel>
                  {intl.formatMessage(messages.candidates)}
                </InputLabel>
                {options.map((option, index) => (
                  <Grid container key={index}>
                    <Grid item xs={10}>
                      <TextField
                        autoComplete='off'
                        className={classes.option}
                        variant='outlined'
                        value={option}
                        error={optionErrors[index]}
                        onChange={(e) => updateOption(index, e.target.value)}
                        InputProps={{
                          className: classes.input,
                        }}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton onClick={() => deleteOption(index)}>
                        <DeleteIcon className={classes.deleteIcon} />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Grid container>
                  <Grid item xs={10}>
                    <TextField
                      autoComplete='off'
                      inputRef={newOptionRef}
                      className={classes.option}
                      variant='outlined'
                      value={newOption}
                      error={newOptionError}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') createOption();
                      }}
                      InputProps={{
                        className: classes.input,
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
            <Grid container alignItems='center'>
              <Switch
                id='secret'
                checked={secret_vote}
                onChange={(e) => setSecretVote(e.target.checked)}
                color='primary'
              />
              <InputLabel htmlFor='secret'>
                {intl.formatMessage(messages.secretVote)}
              </InputLabel>
            </Grid>
            <Grid container justify='flex-end'>
              {loading ? (
                <Button className={classes.loadingButton} disabled={true}>
                  <CircularProgress size={20} />
                </Button>
              ) : (
                <Button
                  className={classes.button}
                  endIcon={<AddIcon />}
                  onClick={submit}
                  disabled={hasErrors}
                >
                  {intl.formatMessage(messages.create)}
                </Button>
              )}
            </Grid>
          </DialogActions>
        </Grid>
      </Grid>
    </Dialog>
  );
}

export default injectIntl(CreatePoll);
