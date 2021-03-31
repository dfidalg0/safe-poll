import React, { useState, createContext, useContext } from 'react';
import { IntlProvider } from 'react-intl';
import { Menu, MenuItem, makeStyles, IconButton } from '@material-ui/core';
import Portuguese from './../messages/pt.json';
import English from './../messages/en.json';
import Spanish from './../messages/es.json';
import { Language as LanguageIcon } from '@material-ui/icons';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    float: 'right',
    borderRadius: 5,
    margin: 5,
  },
}));

export const LocaleContext = createContext();

const local = navigator.language;

function selectLanguage(local) {
  let language;
  switch (local) {
    case 'pt-BR':
      language = Portuguese;
      break;
    case 'es-ES':
      language = Spanish;
      break;
    default:
      language = English;
  }
  return language;
}

export function LocaleSelector({ black }) {
  const color = black ? '#0b1016' : 'white';
  const classes = useStyles();

  const context = useContext(LocaleContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const setLanguage = (lang) => {
    context.changeLanguage(lang);
    setAnchorEl(null);
  };

  return (
    <div className={classes.root} style={{ backgroundColor: color }}>
      <IconButton
        aria-controls='language-menu'
        aria-haspopup='true'
        onClick={handleClick}
      >
        <LanguageIcon style={{ color: black ? 'white' : 'black' }} />
      </IconButton>
      <Menu
        id='language-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setLanguage('pt-BR')}>Português</MenuItem>
        <MenuItem onClick={() => setLanguage('es-ES')}>Español</MenuItem>
        <MenuItem onClick={() => setLanguage('en-US')}>English</MenuItem>
      </Menu>
    </div>
  );
}

const LanguageWrapper = (props) => {
  const [locale, setLocale] = useState(local);
  const [messages, setMessages] = useState(selectLanguage(local));

  function changeLanguage(local) {
    setLocale(local);
    setMessages(selectLanguage(local));
  }

  return (
    <LocaleContext.Provider value={{ locale, changeLanguage }}>
      <IntlProvider messages={messages} locale={locale}>
        {props.children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
};

export default LanguageWrapper;
