import { useCallback, useEffect, useMemo, useReducer } from "react";
import axios from "axios";
import { detectPlatform } from "../utils/detectPlatform";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api";

const initialState = {
  url: "",
  result: null,
  error: "",
  isLoading: false,
  healthStatus: "checking",
  lastPlatform: "unknown"
};

function reducer(state, action) {
  switch (action.type) {
    case "set-url":
      return {
        ...state,
        url: action.value,
        error: "",
        lastPlatform: detectPlatform(action.value)
      };

    case "submit-start":
      return {
        ...state,
        isLoading: true,
        error: "",
        result: null,
        lastPlatform: detectPlatform(state.url)
      };

    case "submit-success":
      return {
        ...state,
        isLoading: false,
        error: "",
        result: action.result,
        lastPlatform: action.result?.platform || state.lastPlatform
      };

    case "submit-error":
      return {
        ...state,
        isLoading: false,
        error: action.error,
        result: null
      };

    case "health-ok":
      return {
        ...state,
        healthStatus: "ok"
      };

    case "health-error":
      return {
        ...state,
        healthStatus: "error"
      };

    case "reset":
      return {
        ...initialState,
        healthStatus: state.healthStatus
      };

    default:
      return state;
  }
}

function normalizeError(error) {
  const serverError = error?.response?.data?.error;

  if (typeof serverError === "string" && serverError.length > 0) {
    return serverError;
  }

  if (typeof error?.message === "string" && error.message.length > 0) {
    return error.message;
  }

  return "URL tidak valid atau platform tidak didukung";
}

function hasSupportedPlatform(url) {
  return detectPlatform(url) !== "unknown";
}

function validateUrl(url) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "URL tidak valid atau platform tidak didukung";
  }

  if (!hasSupportedPlatform(trimmedUrl)) {
    return "URL tidak valid atau platform tidak didukung";
  }

  return "";
}

function normalizeDownload(download, index) {
  const label = download?.label || `Download ${index + 1}`;
  const format = download?.format || "file";
  const url = download?.url || "";

  return {
    label,
    format,
    url
  };
}

function normalizeResult(result) {
  const downloads = Array.isArray(result?.downloads)
    ? result.downloads.map(normalizeDownload).filter((download) => download.url)
    : [];

  return {
    platform: result?.platform || "unknown",
    type: result?.type || "video",
    title: result?.title || "Untitled content",
    thumbnail: result?.thumbnail || "",
    sourceUrl: result?.sourceUrl || "",
    previewUrl: result?.previewUrl || "",
    downloads
  };
}

function canSubmit(state) {
  return Boolean(state.url.trim()) && !state.isLoading;
}

function useDownloader() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const checkHealth = useCallback(async () => {
    try {
      await axios.get(`${API_BASE_URL}/health`, {
        timeout: 5000
      });

      dispatch({ type: "health-ok" });
    } catch {
      dispatch({ type: "health-error" });
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const setUrl = useCallback((value) => {
    dispatch({
      type: "set-url",
      value
    });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const submit = useCallback(
    async (event) => {
      event?.preventDefault();

      const validationError = validateUrl(state.url);

      if (validationError) {
        dispatch({
          type: "submit-error",
          error: validationError
        });
        return;
      }

      dispatch({ type: "submit-start" });

      try {
        const response = await axios.post(
          `${API_BASE_URL}/download`,
          {
            url: state.url.trim()
          },
          {
            timeout: 60000
          }
        );

        const result = normalizeResult(response.data);

        if (result.downloads.length === 0) {
          dispatch({
            type: "submit-error",
            error: "URL tidak valid atau konten tidak dapat diakses"
          });
          return;
        }

        dispatch({
          type: "submit-success",
          result
        });
      } catch (error) {
        dispatch({
          type: "submit-error",
          error: normalizeError(error)
        });
      }
    },
    [state.url]
  );

  const derived = useMemo(
    () => ({
      canSubmit: canSubmit(state),
      serverLabel: state.healthStatus === "ok" ? "SERVER: OK" : "SERVER: ERROR",
      detectedPlatform: detectPlatform(state.url)
    }),
    [state]
  );

  return {
    url: state.url,
    result: state.result,
    error: state.error,
    isLoading: state.isLoading,
    healthStatus: state.healthStatus,
    lastPlatform: state.lastPlatform,
    detectedPlatform: derived.detectedPlatform,
    canSubmit: derived.canSubmit,
    serverLabel: derived.serverLabel,
    setUrl,
    submit,
    reset,
    checkHealth
  };
}

export default useDownloader;
