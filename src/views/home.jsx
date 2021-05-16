import {
  useHistory
} from 'react-router-dom';

import {
  Button, Grid, Typography, Card, CardContent
} from '@material-ui/core';

import {
  KeyboardArrowDown as ArrowDownIcon
} from '@material-ui/icons';

import { Parallax as BaseParallax } from 'react-parallax';

import { useTheme, useMediaQuery } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import { getPath } from '@/utils/routes';

const centerStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
};

const MESSAGE_HEIGHT = '25vh';

const useStyles = makeStyles(theme => ({
  getStartedButton: {
    marginTop: '10px',
    marginBottom: '10px',
    backgroundColor: '#241a77',
    color: 'white',
    '&:hover': {
      backgroundColor: '#02020a',
      color: 'white',
    },
  },
  showMoreButton: {
    position: 'absolute',
    top: 'calc(100vh - 40px)',
    left: '50vw',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    borderRadius: '50%',
    width: '50px',
    height: '50px'
  },
  card: {
    width: '44%',
    margin: '2vh 3% 2vh 3%',
    backgroundColor: '#0f141d',
    color: '#aec7cde0',
    height: `calc((100vh - ${MESSAGE_HEIGHT})/2 - 4vh)`,
    [theme.breakpoints.down('sm')]: {
      width: '94%',
      overflowY: 'scroll'
    }
  },
  subtext: {
    marginTop: '20px',
    color: '#ffffff9c'
  }
}));

export default function Home() {
  const classes = useStyles();

  const router = useHistory();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return <>
    <Parallax
      bgImage={require('@/assets/vote.jpg').default}
      bgImageStyle={{ height: '100vh', width: '100vw' }}
      height='100vh'
      maxOpacity={0.57}
      renderLayer={x => <>
        <Grid container justify="center" alignItems="center"
          direction="column"
          style={{
            // ...centerStyle,
            height: '70%', width: '100%'
          }}
        >
          <Grid item>
            <Typography variant='h6' style={{
              color: 'white', opacity: 0.3 + 0.45 * x
            }}>
              Seja bem vindo ao
            </Typography>
          </Grid>

          <Grid item>
            <Typography variant={isMobile ? 'h2' : 'h1'} style={{
              color: 'white', opacity: 0.3 + 0.45 * x
            }}>
              SafePoll
            </Typography>
          </Grid>
        </Grid>
      </>}
    >
      <Grid container justify="center" alignItems="center"
        direction="column"
        style={{
          marginTop: '70vh',
          height: '30%', width: '100%'
        }}
      >
        <Grid item>
          <Typography variant={isMobile ? 'body2' : 'body1'} align='center' style={{
            color: 'white', opacity: 0.75
          }}>
            Crie enquetes de forma fácil e segura
            </Typography>
        </Grid>

        <Grid item>
          <Button
            onClick={() => router.push(getPath('login'))}
            className={classes.getStartedButton}
            style={{ zIndex: 99 }}
          >
            Comece agora
          </Button>
        </Grid>
      </Grid>
    </Parallax>

    <Button
      className={classes.showMoreButton}
      onClick={() => window.scrollTo(0, window.innerHeight)}
    >
      <ArrowDownIcon style={{ color: 'white' }} />
    </Button>

    <Message
      bgImage={require('@/assets/pie_chart.jpg').default}
      bgImageStyle={{ height: '100vh', width: '100vw' }}
    >
      Visualização completa dos resultados
    </Message>
    <Block>
      <Card className={classes.card} {...(isMobile ? null : {
        style: {
          marginLeft: '53%'
        }
      })}>
        <CardContent>
          <Typography variant='h5'>
            Voto secreto
          </Typography>

          <Typography variant='body1' className={classes.subtext}>
            Nessa modalidade, é possível ver o percentual de votos para cada candidato.
          </Typography>
        </CardContent>
      </Card>

      <Card className={classes.card}>
        <CardContent>
          <Typography variant='h5'>
            Voto não secreto
          </Typography>

          <Typography variant='body1' className={classes.subtext}>
            Nessa modalidade, além do percentual de votos de cada candidato, é possível
            ver a listagem de cada um dos votos mapeados por email.
          </Typography>

          <Typography variant='body1' className={classes.subtext}>
            Todos os dados podem também ser exportados diretamente como uma planilha do Excel.
          </Typography>
        </CardContent>
      </Card>
    </Block>

    <Message
      bgImage={require('@/assets/emails.jpg').default}
    >
      Tenha controle total sobre quem pode votar
    </Message>
    <Block>
      <Card className={classes.card} {...(isMobile ? null : {
        style: {
          marginLeft: '53%'
        }
      })}>
        <CardContent>
          <Typography variant='h5'>
            Token únicos
          </Typography>

          <Typography variant='body1' className={classes.subtext}>
            Nessa modalidade, só uma lista selecionada de emails pode votar.
          </Typography>

          <Typography variant='body1' className={classes.subtext}>
            Cada votante recebe um link único que expira após o uso.
          </Typography>
        </CardContent>
      </Card>

      <Card className={classes.card}>
        <CardContent>
          <Typography variant='h5'>
            Link de acesso
          </Typography>

          <Typography variant='body1' className={classes.subtext}>
            Nessa modalidade, qualquer um que possuir o link da eleição pode votar.
          </Typography>
        </CardContent>
      </Card>
    </Block>
  </>
}


/**
 * @param {import('react-parallax').ParallaxProps & {
 *   height?: string | number
 *   insideProps?: import('react').HTMLAttributes<HTMLDivElement>,
 *   center?: boolean,
 *   maxOpacity?: number
 * }} props
 */
function Parallax ({ height = 400, center = true, maxOpacity = 0.5, ...props } = {}) {
  return <BaseParallax {...props} renderLayer={x => (
    <div
      style={{
        ...(center ? centerStyle : {}),
        background: `rgba(0, 0, 0, ${x * maxOpacity})`,
        width: '100%',
        height,
      }}
    >
      {props.renderLayer(x)}
    </div>
  )}>
    <div style={{ height }}>
      <div {...props.insideProps} style={{
        ...(center ? centerStyle : {}),
        ...props.insideProps?.style
      }}>
        {props.children}
      </div>
    </div>
  </BaseParallax>;
}

/**
 * @param {Parameters<Parallax>[0]} props
 */
function Message(props) {
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

  return <Parallax {...props}
    height={MESSAGE_HEIGHT}
    renderLayer={x => (
      <Typography variant={isMobile ? 'h6' : 'h4'} style={{
        ...centerStyle,
        color: 'white', opacity: 0.3 + 0.45 * x
      }}>
        {props.children}
      </Typography>
    )}
    maxOpacity={0.75}
  >{null}</Parallax>
};

/**
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
function Block(props) {
  return <div {...props} style={{
    height: `calc(100vh - ${MESSAGE_HEIGHT})`,
    ...props.style,
  }}>
    {props.children}
  </div>
}
