// Dati finti con la stessa forma delle risposte reali delle API NYT.

export function rawTopStory(n, overrides = {}) {
  return {
    section: "world",
    subsection: "",
    title: `Top story ${n}`,
    abstract: `Abstract of story ${n}.`,
    url: `https://www.nytimes.com/2026/10/12/world/story-${n}.html`,
    uri: `nyt://article/${n}`,
    byline: `By Reporter ${n}`,
    item_type: "Article",
    updated_date: "2026-10-12T10:00:00-04:00",
    created_date: "2026-10-12T08:00:00-04:00",
    published_date: "2026-10-12T08:00:00-04:00",
    kicker: "",
    multimedia: [
      {
        url: `https://static01.nyt.com/images/${n}-superJumbo.jpg`,
        format: "Super Jumbo",
        height: 1365,
        width: 2048,
        type: "image",
        subtype: "photo",
        caption: `Caption ${n}`,
        copyright: `Photographer ${n}`,
      },
      {
        url: `https://static01.nyt.com/images/${n}-threeByTwoSmallAt2X.jpg`,
        format: "threeByTwoSmallAt2X",
        height: 400,
        width: 600,
        type: "image",
        subtype: "photo",
        caption: `Caption ${n}`,
        copyright: `Photographer ${n}`,
      },
      {
        url: `https://static01.nyt.com/images/${n}-thumbLarge.jpg`,
        format: "Large Thumbnail",
        height: 150,
        width: 150,
        type: "image",
        subtype: "photo",
        caption: `Caption ${n}`,
        copyright: `Photographer ${n}`,
      },
    ],
    ...overrides,
  };
}

export function rawPopular(n, overrides = {}) {
  return {
    uri: `nyt://article/popular-${n}`,
    url: `https://www.nytimes.com/2026/10/11/us/popular-${n}.html`,
    id: 100000 + n,
    published_date: "2026-10-11",
    section: "U.S.",
    subsection: "",
    byline: `By Writer ${n}`,
    title: `Popular story ${n}`,
    abstract: `Popular abstract ${n}.`,
    media: [
      {
        type: "image",
        subtype: "photo",
        caption: `Popular caption ${n}`,
        copyright: `Agency ${n}`,
        "media-metadata": [
          { url: `https://static01.nyt.com/images/p${n}-thumbStandard.jpg`, format: "Standard Thumbnail", height: 75, width: 75 },
          { url: `https://static01.nyt.com/images/p${n}-mediumThreeByTwo210.jpg`, format: "mediumThreeByTwo210", height: 140, width: 210 },
          { url: `https://static01.nyt.com/images/p${n}-mediumThreeByTwo440.jpg`, format: "mediumThreeByTwo440", height: 293, width: 440 },
        ],
      },
    ],
    ...overrides,
  };
}

export function rawSearchDoc(n, overrides = {}) {
  return {
    abstract: `Search abstract ${n}.`,
    byline: { original: `By Author ${n}` },
    headline: { main: `Search result ${n}`, kicker: "", print_headline: "" },
    _id: `nyt://article/search-${n}`,
    uri: `nyt://article/search-${n}`,
    multimedia: {
      caption: `Search caption ${n}`,
      credit: `Credit ${n}`,
      default: { url: `https://static01.nyt.com/images/s${n}-articleLarge.jpg`, height: 400, width: 600 },
      thumbnail: { url: `https://static01.nyt.com/images/s${n}-thumbStandard.jpg`, height: 75, width: 75 },
    },
    pub_date: "2026-10-10T09:00:00Z",
    section_name: "Climate",
    snippet: `Snippet ${n}.`,
    web_url: `https://www.nytimes.com/2026/10/10/climate/search-${n}.html`,
    ...overrides,
  };
}

// Notizie già trasformate dal modello, per i test che non passano dall'API.
export function article(n, overrides = {}) {
  return {
    id: `nyt://article/${n}`,
    url: `https://www.nytimes.com/story-${n}.html`,
    title: `Story ${n}`,
    abstract: `Abstract ${n}`,
    byline: `By Reporter ${n}`,
    section: "world",
    subsection: "",
    kicker: "",
    publishedAt: "2026-10-12T12:00:00.000Z",
    image: {
      large: `https://static01.nyt.com/images/${n}-large.jpg`,
      medium: `https://static01.nyt.com/images/${n}-medium.jpg`,
      square: `https://static01.nyt.com/images/${n}-square.jpg`,
      caption: "",
      credit: "",
    },
    ...overrides,
  };
}

export function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}
