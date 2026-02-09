import React, { useEffect, useMemo, useState } from "react";
import type { ScenarioResult } from "../domain/vmx-domain";
import { formatMoney } from "../utils/format";

type Snapshot = {
  id: string;
  name: string;
  createdAtIso: string;
  currency: string;
  totalCost: number;
  totalPsqft?: number;
  payload: ScenarioResult;
};

function loadSnapshots(snapshots: Snapshot[]): Snapshot[] {
  return Array.isArray(snapshots) ? snapshots : [];
}

function persistSnapshots(
  next: Snapshot[],
  onSnapshotsChange: (snapshots: Snapshot[]) => void
) {
  onSnapshotsChange(next);
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SnapshotPanel({
  current,
  snapshots,
  onSnapshotsChange,
}: {
  current: ScenarioResult | null;
  snapshots: Snapshot[];
  onSnapshotsChange: (snapshots: Snapshot[]) => void;
}) {
  const [name, setName] = useState<string>("");

  const canSave = !!current;

  const defaultName = useMemo(() => {
    const d = new Date();
    const stamp = d.toISOString().slice(0, 16).replace("T", " ");
    return `Snapshot — ${stamp}`;
  }, []);

  function onSave() {
    if (!current) return;

    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const createdAtIso = new Date().toISOString();

    const snap: Snapshot = {
      id,
      name: (name || defaultName).trim(),
      createdAtIso,
      currency: current.currency,
      totalCost: current.totalCost,
      totalPsqft: (current as any).totalPsqft, // optional if present in your domain model
      payload: current,
    };

    persistSnapshots([snap, ...snapshots], onSnapshotsChange);
    setName("");
  }

  function onDelete(id: string) {
    persistSnapshots(
      snapshots.filter((s) => s.id !== id),
      onSnapshotsChange
    );
  }

  function onExportOne(s: Snapshot) {
    const safeName = s.name.replace(/[^a-z0-9\-_ ]/gi, "").trim().slice(0, 60) || "snapshot";
    downloadJson(`vmx_${safeName}.json`, s);
  }

  function onExportAll() {
    downloadJson("vmx_snapshots_all.json", snapshots);
  }

  return (
    <div className="card">
      <div className="adminHeader">
        <div>
          <h2>Snapshots</h2>
          <div className="muted">Save Scenario A results as point-in-time references.</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            className="input"
            style={{ width: 260 }}
            placeholder={defaultName}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="button" onClick={onSave} disabled={!canSave}>
            Save Snapshot
          </button>
          <button type="button" onClick={onExportAll} disabled={snapshots.length === 0}>
            Export All
          </button>
        </div>
      </div>

      {!current ? (
        <div className="muted" style={{ marginTop: 10 }}>
          No current scenario result available to snapshot.
        </div>
      ) : null}

      {snapshots.length === 0 ? (
        <div className="muted" style={{ marginTop: 10 }}>
          No snapshots saved yet.
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {snapshots.map((s) => (
            <div
              key={s.id}
              style={{
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 14,
                padding: 12,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 900 }}>{s.name}</div>
                <div className="muted" style={{ marginTop: 2 }}>
                  {new Date(s.createdAtIso).toLocaleString()}
                  {" • "}
                  Total: {formatMoney(s.totalCost, s.currency)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => onExportOne(s)}>
                  Export
                </button>
                <button type="button" onClick={() => onDelete(s.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
