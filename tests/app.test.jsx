import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import App from "../src/App.jsx";
import { createFakeApi } from "./fakeApi.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
    data,
  };
}

function renderApp({ path = "/", api = createFakeApi(), storage = memoryStorage() } = {}) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <App api={api} storage={storage} />
    </MemoryRouter>,
  );
  return { api, storage, user };
}

describe("home page", () => {
  it("shows the lead story, the other blocks and the most popular list", async () => {
    const { api } = renderApp();

    expect(await screen.findByRole("heading", { level: 2, name: "Home story 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Opinion" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home story 4" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Popular 1" })).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(within(main).getByRole("link", { name: "Arts" })).toHaveAttribute("href", "/section/arts");
    expect(api.calls.topStories).toEqual(["home"]);
  });

  it("opens articles on nytimes.com in a new tab", async () => {
    renderApp();
    const link = await screen.findByRole("link", { name: "Home story 1" });
    expect(link).toHaveAttribute("href", "https://www.nytimes.com/story-1.html");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows an error with a retry button that loads the news", async () => {
    const api = createFakeApi({ failures: { topStories: 1 } });
    const { user } = renderApp({ api });

    expect(await screen.findByRole("alert")).toHaveTextContent(/limit was reached/);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: "Home story 1" })).toBeInTheDocument();
    expect(api.calls.topStories).toEqual(["home", "home"]);
  });

  it("inserts titles as text, not HTML", async () => {
    const api = createFakeApi({
      topStories: {
        home: [{ id: "x", url: "https://www.nytimes.com/x.html", title: "<img src=x onerror=alert(1)>", section: "us", image: null }],
      },
    });
    renderApp({ api });
    expect(await screen.findByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
    expect(document.querySelector("img[src='x']")).toBeNull();
  });
});

describe("navigation", () => {
  it("opens a section from the nav bar and reuses the cached home when going back", async () => {
    const { api, user } = renderApp();
    await screen.findByRole("heading", { name: "Home story 1" });

    const nav = screen.getByRole("navigation", { name: "Sections" });
    await user.click(within(nav).getByRole("link", { name: "World" }));
    expect(await screen.findByRole("heading", { level: 1, name: "World" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "world story 1" })).toBeInTheDocument();
    expect(document.title).toBe("World · The New York Times Clone");

    await user.click(screen.getAllByRole("link", { name: /home page/i })[0]);
    expect(await screen.findByRole("heading", { name: "Home story 1" })).toBeInTheDocument();
    expect(api.calls.topStories).toEqual(["home", "world"]);
  });

  it("maps the Books section to the books/review endpoint", async () => {
    const { api } = renderApp({ path: "/section/books" });
    expect(await screen.findByRole("heading", { level: 1, name: "Books" })).toBeInTheDocument();
    await waitFor(() => expect(api.calls.topStories).toEqual(["books/review"]));
  });

  it("shows a not found page for unknown sections and paths", async () => {
    renderApp({ path: "/section/cooking" });
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });

  it("opens and closes the side menu with Escape", async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole("button", { name: "Open sections menu" }));
    const menu = screen.getByRole("dialog", { name: "All sections" });
    expect(within(menu).getByRole("link", { name: "Real Estate" })).toHaveAttribute("href", "/section/realestate");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("saved articles", () => {
  it("saves a story, counts it in the header and lists it on the Saved page", async () => {
    const { user, storage } = renderApp();
    await user.click(await screen.findByRole("button", { name: "Save “Home story 2” for later" }));

    expect(screen.getByLabelText("1 saved article")).toBeInTheDocument();
    expect(JSON.parse(storage.data["nyt-clone:saved"])[0].title).toBe("Home story 2");

    await user.click(screen.getByRole("link", { name: /Saved/ }));
    expect(await screen.findByRole("heading", { name: "Saved articles" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home story 2" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove “Home story 2” from saved articles" }));
    expect(screen.getByText(/Nothing saved yet/)).toBeInTheDocument();
  });

  it("restores saved articles from storage", async () => {
    const saved = [{ id: "a", url: "https://www.nytimes.com/a.html", title: "Kept story", image: null }];
    renderApp({ path: "/saved", storage: memoryStorage({ "nyt-clone:saved": JSON.stringify(saved) }) });
    expect(screen.getByRole("link", { name: "Kept story" })).toBeInTheDocument();
  });
});

describe("search", () => {
  it("searches from the header and loads more results", async () => {
    const { api, user } = renderApp();
    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "climate{Enter}");

    expect(await screen.findByText("25 results for “climate”")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2, name: /climate result/ })).toHaveLength(10);

    await user.click(screen.getByRole("button", { name: "Show more" }));
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 2, name: /climate result/ })).toHaveLength(20));
    await user.click(screen.getByRole("button", { name: "Show more" }));
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 2, name: /climate result/ })).toHaveLength(25));
    expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    expect(api.calls.search.map((call) => call.page)).toEqual([0, 1, 2]);
  });

  it("updates the search field when a new search starts from the header", async () => {
    const { user } = renderApp({ path: "/search?q=mars" });
    const pageField = () => within(screen.getByRole("main")).getByRole("searchbox", { name: "Search articles" });
    await screen.findByText("25 results for “mars”");
    expect(pageField()).toHaveValue("mars");

    const header = screen.getByRole("banner");
    await user.click(within(header).getByRole("button", { name: "Search" }));
    await user.type(within(header).getByRole("searchbox"), "venus{Enter}");

    expect(await screen.findByText("25 results for “venus”")).toBeInTheDocument();
    expect(pageField()).toHaveValue("venus");
  });

  it("changes the sort order from the toolbar", async () => {
    const { api, user } = renderApp({ path: "/search?q=mars" });
    await screen.findByText("25 results for “mars”");
    await user.selectOptions(screen.getByRole("combobox"), "newest");
    await waitFor(() => expect(api.calls.search.at(-1)).toEqual({ query: "mars", page: 0, sort: "newest" }));
  });

  it("recovers from a failed search with Try again", async () => {
    const api = createFakeApi({ failures: { search: 1 } });
    const { user } = renderApp({ path: "/search?q=mars", api });
    expect(await screen.findByRole("alert")).toHaveTextContent(/not responding/);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("25 results for “mars”")).toBeInTheDocument();
  });

  it("tells the user when nothing matches", async () => {
    renderApp({ path: "/search?q=zzz", api: createFakeApi({ searchHits: 0 }) });
    expect(await screen.findByText(/No articles match/)).toBeInTheDocument();
  });
});
