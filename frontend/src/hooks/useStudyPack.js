import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios-instance";

const errMsg = (e) =>
  e?.response?.data?.error?.message ?? e?.response?.data?.message ?? e.message;

// No response at all (server off / network error) or a gateway error
const serverDown = (e) =>
  !e?.response || [502, 503, 504].includes(e.response.status);

// state: loading | none | processing | done | failed
export default function useStudyPack(materialId, enabled) {
  const navigate = useNavigate();
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const timer = useRef(null);
  const alive = useRef(true);

  // silent = true on the first page-load check, so an old FAILED pack doesn't pop a toast
  const run = useCallback(async (method, silent = false) => {
    clearTimeout(timer.current);
    try {
      const res = await axiosInstance[method](`/materials/${materialId}/study`);
      if (!alive.current) return;
      const p = res.data?.data ?? res.data;
      if (p.status === "DONE") {
        setState("done");
      } else if (p.status === "FAILED") {
        const msg = p.errorMessage || "Couldn't generate study notes.";
        setError(msg);
        setState("failed");
        if (!silent) toast.error("Couldn't generate notes", { description: msg });
      } else {
        setState("processing");
        timer.current = setTimeout(() => run("get"), 3000);
      }
    } catch (e) {
      if (!alive.current) return;
      if (serverDown(e)) {
        toast.error("Server is down", {
          description: "Couldn't reach the server. Redirecting to home.",
        });
        setTimeout(() => navigate("/", { replace: true }), 1000);
        return;
      }
      if (method === "get" && e?.response?.status === 404) {
        setState("none"); // no pack yet -> show the Generate button
        return;
      }
      const msg = errMsg(e);
      setError(msg);
      setState("failed");
      toast.error("Couldn't generate notes", { description: msg });
    }
  }, [materialId, navigate]);

  useEffect(() => {
    if (!enabled) return;
    alive.current = true;
    run("get", true);
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, [enabled, run]);

  const generate = useCallback(() => {
    setState("processing");
    setError(null);
    run("post");
  }, [run]);

  return { state, error, generate };
}

// Loads "notes" or "flashcards" once the pack is done and that tab has been opened
export function useStudyPart(materialId, part, ready, active) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ready || !active || data) return;
    let cancelled = false;
    axiosInstance
      .get(`/materials/${materialId}/study/${part}`)
      .then((res) => !cancelled && setData(res.data?.data ?? res.data))
      .catch((e) => {
        if (cancelled) return;
        if (serverDown(e)) {
          toast.error("Server is down", {
            description: "Couldn't reach the server. Redirecting to home.",
          });
          setTimeout(() => navigate("/", { replace: true }), 1000);
          return;
        }
        const msg = errMsg(e);
        setError(msg);
        toast.error(`Couldn't load ${part}`, { description: msg });
      });
    return () => { cancelled = true; };
  }, [materialId, part, ready, active, data, navigate]);

  return { data, error };
}