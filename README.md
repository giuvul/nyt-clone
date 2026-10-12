# The New York Times · Clone

**▶ Prova il sito: <https://nyt-clone-giuvul.netlify.app/>**

Un clone della home page del [New York Times](https://www.nytimes.com/) costruito con **React**.
Le notizie arrivano in tempo reale dalle [API ufficiali del NYT](https://developer.nytimes.com/):
la home mostra le Top Stories nell'ordine scelto dalla redazione, con apertura, colonna Opinion,
classifica dei più letti e fasce per sezione. In più: pagine per 23 sezioni, ricerca nell'archivio
e articoli salvati per dopo.

Progetto del modulo React del Master in AI e Agenti AI per il Business (Università degli Studi
Guglielmo Marconi). È un clone didattico e non ufficiale: titoli, sommari e foto restano del New
York Times e ogni notizia rimanda all'articolo originale su nytimes.com.

> **Nota sull'uso dell'IA.** Struttura dell'app, scelte tecniche e design sono miei. Mi sono fatto
> assistere da un modello linguistico per scrivere parte del codice e dei test, che ho poi rivisto,
> provato con i dati reali e corretto dove serviva.

![La home su desktop](docs/screenshot-home.jpg)

## Funzionalità

- **Home come l'originale**: testata gotica con la data, barra delle sezioni, notizia d'apertura con
  foto grande, notizie secondarie, colonna laterale con Opinion e **Most Popular** (i 6 articoli più
  letti nelle ultime 24 ore), poi le fasce per sezione (World, U.S., Tech…).
- **Pagine di sezione** (`/section/world`, `/section/books`…) per 23 sezioni, con il menu laterale
  che le elenca tutte.
- **Ricerca nell'archivio** dal 1851 (Article Search API), ordinabile per rilevanza, più recenti o
  più vecchi, con "Show more" per caricare altre pagine. La ricerca vive nell'URL, quindi si può
  condividere e il tasto Indietro funziona.
- **Articoli salvati**: l'icona segnalibro su ogni notizia la aggiunge alla pagina *Saved*; il
  contatore nell'intestazione si aggiorna subito e l'elenco resta salvato nel browser.
- **Caricamento ed errori gestiti**: segnaposto grigi mentre arrivano i dati, messaggio chiaro con
  pulsante *Try again* se la rete o l'API non rispondono, *Refresh* per ricaricare.
- **Responsive e accessibile**: tre layout (smartphone, tablet, desktop), link "Skip to content",
  menu chiudibile con Esc, focus visibile, testi alternativi, nessuno scroll orizzontale.

<img src="docs/screenshot-mobile.jpg" alt="La home su smartphone" width="300">

## Come funziona

```
Browser (React)                          Netlify                               NYT
──────────────────                       ─────────────────────────────         ─────────────────────
GET /api/topstories/home   ───────────►  Function nyt.mjs                ───►  /topstories/v2/home.json
GET /api/mostpopular/viewed/1            + chiave segreta NYT_API_KEY          /mostpopular/v2/viewed/1.json
GET /api/search?q=...&page=...           + solo endpoint ammessi               /search/v2/articlesearch.json
                           ◄───────────  + cache CDN (10 min / 1 h / 30 min) ◄─
```

Il browser non chiama mai direttamente il NYT. Le richieste passano da una **Netlify Function**
(`netlify/functions/nyt.mjs`, logica in `server/nytProxy.js`) per tre motivi:

1. **La chiave resta segreta.** Una chiave messa in una variabile `VITE_…` finirebbe nel JavaScript
   scaricato da chiunque. Qui vive solo nelle variabili d'ambiente di Netlify.
2. **Solo gli endpoint che servono.** Il proxy accetta le sezioni note, i periodi validi di Most
   Popular e ricerche con parametri controllati; tutto il resto riceve un 404 senza toccare l'API.
3. **Si resta nei limiti.** L'API gratuita consente 5 richieste al minuto e 500 al giorno. Le
   risposte vengono salvate dalla CDN di Netlify (10 minuti per le Top Stories, 1 ora per Most
   Popular, 30 minuti per le ricerche): migliaia di visitatori producono poche chiamate reali.

In sviluppo lo stesso codice del proxy gira come middleware di Vite, con la chiave letta da `.env`.

## Struttura del progetto

Come suggerito nel video del corso, i file sono raggruppati per funzione dentro `src/`:

```
.
├── index.html
├── netlify.toml                   build, pubblicazione e redirect della single page app
├── netlify/functions/nyt.mjs      Netlify Function: espone /api/* in produzione
├── server/nytProxy.js             proxy: chiave, endpoint ammessi, cache, errori
├── src/
│   ├── main.jsx                   punto di ingresso: router e api reale
│   ├── App.jsx                    provider dello stato globale e rotte
│   ├── api/nytApi.js              repository: chiamate HTTP con Axios
│   ├── models/article.js          trasforma le 3 risposte dell'API in un unico oggetto "articolo"
│   ├── store/                     stato globale con Context API + useReducer
│   │   ├── NewsContext.jsx        cache delle notizie, useTopStories, useMostPopular
│   │   ├── newsReducer.js
│   │   ├── SavedContext.jsx       articoli salvati, persistiti in localStorage
│   │   └── savedReducer.js
│   ├── hooks/                     useArticleSearch (paginazione), useDocumentTitle
│   ├── pages/                     HomePage, SectionPage, SearchPage, SavedPage, NotFoundPage
│   ├── components/                ArticleCard, MostPopular, SectionBlock, SaveButton, StatusMessage…
│   │   └── layout/                Header, Masthead, SectionNav, SideMenu, HeaderSearch, Footer
│   ├── config/sections.js         elenco delle sezioni (etichetta, URL, nome per l'API)
│   ├── utils/                     date in stile NYT, divisione della home in blocchi
│   ├── styles/global.css          variabili di colore e font, classi comuni
│   └── assets/fonts/              font della testata (Chomsky, licenza OFL)
├── tests/                         test con Vitest e Testing Library
└── docs/                          screenshot
```

Ogni componente ha accanto il suo foglio di stile (`ArticleCard.module.css`): con i **CSS Modules**
le classi valgono solo per quel componente e non si scontrano tra loro.

## Scelte motivate

**React Router.** Cinque rotte (`/`, `/section/:slug`, `/search`, `/saved`, `*`) dentro un unico
`Layout` con intestazione e piè di pagina. La sezione attiva è evidenziata con `NavLink`, la ricerca
usa `useSearchParams` così lo stato sta nell'URL. Su Netlify un redirect manda ogni percorso a
`index.html`, quindi anche aprire direttamente `/section/arts` funziona.

**Axios.** Un'istanza con `baseURL: "/api"` e timeout di 15 secondi, usata solo in
`api/nytApi.js`. Gli errori di Axios diventano messaggi comprensibili ("limite dell'API raggiunto,
riprova tra un minuto") in un solo punto.

**Context API invece di Redux.** Lo stato condiviso è poco: la cache delle notizie e gli articoli
salvati. Due context con `useReducer` bastano, senza dipendenze in più. La cache evita richieste
inutili: tornando alla home dopo aver visto una sezione, le notizie compaiono subito e l'API non
viene richiamata per 5 minuti.

**Repository + Dependency Injection.** `NewsProvider` riceve l'api come prop. In produzione
`main.jsx` passa quella reale, nei test un oggetto finto con gli stessi tre metodi. Così tutta l'app
si prova senza rete e senza chiave.

**Un solo modello di articolo.** Top Stories, Most Popular e Article Search descrivono le foto in tre
modi diversi (anche l'Article Search ha cambiato formato di recente: il modello gestisce entrambi).
`models/article.js` li riduce allo stesso oggetto, e i componenti non devono sapere da dove arriva
una notizia.

**Hooks.** `useState`, `useEffect`, `useReducer`, `useMemo`, `useCallback`, `useRef`, `useContext`
più tre hook personalizzati: `useTopStories`, `useMostPopular` e `useArticleSearch` (che ignora le
risposte arrivate in ritardo dopo una nuova ricerca).

**Design.** Font liberi vicini a quelli del giornale: *Source Serif 4* per titoli e testo, *Libre
Franklin* (erede del Franklin Gothic usato dal NYT) per menu e didascalie, *Chomsky* per la testata,
ridotto alle sole lettere necessarie (6 KB). Palette in bianco e nero con filetti sottili, come
l'originale.

**Convenzioni** ([W3Schools JS Style Guide](https://www.w3schools.com/js/js_conventions.asp)):
camelCase per variabili e funzioni, PascalCase per i componenti, costanti in MAIUSCOLO, 2 spazi di
indentazione, punto e virgola, virgolette doppie, un componente per file.

## Test

67 test automatici con **Vitest** e **Testing Library**, senza chiamate di rete.

| File | Cosa verifica |
| --- | --- |
| `nytProxy.test.js` | endpoint ammessi e rifiutati, chiave aggiunta lato server e mai restituita, 429 e errori non in cache, header di cache, cache in memoria |
| `article.test.js` | i tre formati dell'API, scelta del formato di foto, campi mancanti, doppioni |
| `nytApi.test.js` | URL e parametri chiamati, messaggi di errore |
| `homeLayout.test.js` | divisione della home in apertura, secondarie, Opinion e fasce per sezione |
| `reducers.test.js` | cache delle notizie e articoli salvati |
| `format.test.js` | date in stile AP ("Oct. 12, 2026"), "3h ago" |
| `app.test.jsx` | integrazione: home, navigazione con cache, sezione Books, 404, menu, errore e Try again, salvataggio, ricerca con Show more e ordinamento, titoli inseriti come testo |

```bash
npm test
```

## Provarlo in locale

Serve [Node.js](https://nodejs.org/) 20.19 o successivo e una chiave gratuita della NYT API: su
[developer.nytimes.com](https://developer.nytimes.com/get-started) crea un'app, attiva *Top Stories*,
*Most Popular* e *Article Search* e copia la **Key** (il *Secret* non serve).

```bash
git clone https://github.com/giuvul/nyt-clone.git
cd nyt-clone
npm install
cp .env.example .env      # poi scrivi la chiave dopo NYT_API_KEY=
npm run dev               # http://localhost:5173
npm test
npm run build             # build di produzione in dist/
```

Per pubblicarlo su Netlify basta collegare il repository e aggiungere la variabile d'ambiente
`NYT_API_KEY`: build, function e redirect sono già in `netlify.toml`.

## Tecnologie

- **React 19** con hooks e **CSS Modules**
- **React Router 8**
- **Axios**
- **Context API** + `useReducer`
- **Vite** per sviluppo e build
- **Vitest**, **Testing Library**, **jsdom** per i test
- **Netlify** (hosting, Functions, cache CDN)
- Font: Source Serif 4, Libre Franklin (Fontsource), Chomsky

## Limiti

- L'API gratuita ha un limite di 5 richieste al minuto: la cache lo rende invisibile nell'uso normale,
  ma ricerche molto rapide e diverse tra loro possono ricevere il messaggio "limit reached".
- Le Top Stories restituiscono 20–40 notizie: la home ha meno contenuti di quella vera, e le fasce
  per sezione dipendono da cosa ha scelto la redazione quel giorno.
- Gli articoli si leggono su nytimes.com, che può chiedere un abbonamento.
- Gli articoli salvati restano nel browser in cui sono stati salvati.

## Autore

**Giuseppe Vulduraro** · [giuseppevulduraro.com](https://giuseppevulduraro.com/) ·
[GitHub](https://github.com/giuvul)
