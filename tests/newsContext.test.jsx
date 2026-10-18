import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it } from "vitest";
import { FRESH_FOR_MS, NewsProvider, useTopStories } from "../src/store/NewsContext.jsx";
import { createFakeApi } from "./fakeApi.js";

function setup({ api = createFakeApi(), section = "world" } = {}) {
  let time = 0;
  const clock = {
    now: () => time,
    advance: (ms) => {
      time += ms;
    },
  };
  const wrapper = ({ children }) => (
    <NewsProvider api={api} now={clock.now}>
      {children}
    </NewsProvider>
  );
  const hook = renderHook(({ section: current }) => useTopStories(current), {
    wrapper,
    initialProps: { section },
  });
  return { api, clock, hook };
}

describe("NewsProvider", () => {
  it("loads a section once and serves it from the cache while fresh", async () => {
    const { api, clock, hook } = setup();
    await waitFor(() => expect(hook.result.current.status).toBe("success"));

    hook.rerender({ section: "arts" });
    await waitFor(() => expect(hook.result.current.data.articles[0].section).toBe("arts"));
    clock.advance(FRESH_FOR_MS - 1);
    hook.rerender({ section: "world" });

    expect(hook.result.current.data.articles[0].section).toBe("world");
    expect(api.calls.topStories).toEqual(["world", "arts"]);
  });

  it("asks the API again once the cached copy is stale", async () => {
    const { api, clock, hook } = setup();
    await waitFor(() => expect(hook.result.current.status).toBe("success"));
    hook.rerender({ section: "arts" });
    await waitFor(() => expect(api.calls.topStories).toEqual(["world", "arts"]));

    clock.advance(FRESH_FOR_MS + 1);
    hook.rerender({ section: "world" });
    await waitFor(() => expect(api.calls.topStories).toEqual(["world", "arts", "world"]));
  });

  it("reloads on demand even when the data is fresh", async () => {
    const { api, hook } = setup();
    await waitFor(() => expect(hook.result.current.status).toBe("success"));
    await act(() => hook.result.current.reload());
    expect(api.calls.topStories).toEqual(["world", "world"]);
  });

  it("does not treat a failed request as cached", async () => {
    const api = createFakeApi({ failures: { topStories: 1 } });
    const { hook } = setup({ api });
    await waitFor(() => expect(hook.result.current.status).toBe("error"));
    await act(() => hook.result.current.reload());
    expect(hook.result.current.status).toBe("success");
  });

  it("sends a single request in Strict Mode, despite the double render and effect", async () => {
    const api = createFakeApi();
    function Probe() {
      const { status } = useTopStories("home");
      return <p>{status}</p>;
    }
    render(
      <StrictMode>
        <NewsProvider api={api}>
          <Probe />
        </NewsProvider>
      </StrictMode>,
    );
    expect(await screen.findByText("success")).toBeInTheDocument();
    expect(api.calls.topStories).toEqual(["home"]);
  });
});
