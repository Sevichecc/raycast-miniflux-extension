import fetch from "node-fetch";
import { getPreferenceValues } from "@raycast/api";
import { Preferences, MinifluxApiError, MinifluxEntries, MinifluxEntry, IconData, originArticle } from "./types";

const removeTrailingSlash = (baseUrl: string): string =>
  baseUrl.charAt(baseUrl.length - 1) === "/" ? baseUrl.slice(0, -1) : baseUrl;

const fetchData = async <T>(endpoint: string, queryParams?: string): Promise<T> => {
  const preferences: Preferences = getPreferenceValues();
  const { baseUrl, apiKey } = preferences;
  const apiUrl = removeTrailingSlash(baseUrl);

  const response = await fetch(apiUrl + endpoint + (queryParams || ""), {
    method: "get",
    headers: {
      "X-Auth-Token": apiKey,
    },
  });

  if (!response.ok) {
    throw (await response.json()) as MinifluxApiError;
  }

  return (await response.json()) as T;
};

export const fetchEntriesWithParams = async <T>(queryParams: string): Promise<T> => {
  return await fetchData<T>("/v1/entries", queryParams);
};

export const search = async (query: string): Promise<MinifluxEntries> => {
  const preferences: Preferences = getPreferenceValues();
  const { searchLimit } = preferences;

  return await fetchEntriesWithParams(`?search=${query}${searchLimit ? "&limit=" + searchLimit : ""}`);
};

export const getRecentEntries = async (): Promise<MinifluxEntries> => {
  const preferences: Preferences = getPreferenceValues();
  const { feedLimit } = preferences;

  return await fetchEntriesWithParams(`?status=unread&direction=desc&limit=${feedLimit}`);
};

export const getEntryUrlInMiniflux = ({ id, status }: MinifluxEntry): string => {
  const preferences: Preferences = getPreferenceValues();
  const { baseUrl } = preferences;
  const entryStatus = status === "read" ? "history" : status;

  return `${baseUrl}/${entryStatus}/entry/${id}`;
};

export const fetchIconForFeed = async ({ feed_id }: MinifluxEntry): Promise<IconData> => {
  return await fetchData<IconData>(`/v1/feeds/${feed_id}/icon`);
};

export const fetchOriginArticle = async ({ id }: MinifluxEntry): Promise<originArticle> => {
  return await fetchData(`/v1/entries/${id}/fetch-content`);
};

// /v1/entries/1234/bookmark
const updateData = async <T>(endpoint: string, method: "post" | "put"): Promise<T> => {
  const preferences: Preferences = getPreferenceValues();
  const { baseUrl, apiKey } = preferences;
  const apiUrl = removeTrailingSlash(baseUrl);

  const response = await fetch(apiUrl + endpoint, {
    method,
    headers: {
      "X-Auth-Token": apiKey,
    },
  });

  if (!response.ok) {
    throw (await response.json()) as MinifluxApiError;
  }

  return response.status as T;
};

export const toggleBookmark = async ({ id }: MinifluxEntry): Promise<boolean> => {
  const statusCode = await updateData<number>(`/v1/entries/${id}/bookmark`, "put");

  return statusCode === 204;
};
