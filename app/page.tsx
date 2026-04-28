"use client";

import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import SectionCard from "./components/SectionCard";
import ConditionForm from "./components/ConditionForm";
import RestaurantForm from "./components/RestaurantForm";
import RestaurantList from "./components/RestaurantList";
import ProposalPanel from "./components/ProposalPanel";
import {
  DEFAULT_CONDITION,
  DEFAULT_RESTAURANTS,
  STORAGE_KEYS,
} from "./lib/mockData";
import type { EventCondition, Restaurant } from "./lib/types";

type Draft = Omit<Restaurant, "id" | "selected">;

function makeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function Home() {
  const [condition, setCondition] =
    useState<EventCondition>(DEFAULT_CONDITION);
  const [restaurants, setRestaurants] =
    useState<Restaurant[]>(DEFAULT_RESTAURANTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  // Load from localStorage on mount (client only) — keeps SSR/initial render stable.
  useEffect(() => {
    try {
      const rawCond = localStorage.getItem(STORAGE_KEYS.condition);
      if (rawCond) {
        const parsed = JSON.parse(rawCond) as Partial<EventCondition>;
        setCondition({ ...DEFAULT_CONDITION, ...parsed });
      }
      const rawRest = localStorage.getItem(STORAGE_KEYS.restaurants);
      if (rawRest) {
        const parsed = JSON.parse(rawRest) as Restaurant[];
        if (Array.isArray(parsed)) {
          setRestaurants(parsed);
        }
      }
    } catch {
      // ignore parse errors and keep defaults
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.condition,
        JSON.stringify(condition),
      );
    } catch {
      /* noop */
    }
  }, [condition, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.restaurants,
        JSON.stringify(restaurants),
      );
    } catch {
      /* noop */
    }
  }, [restaurants, hydrated]);

  const editingRestaurant =
    editingId ? restaurants.find((r) => r.id === editingId) ?? null : null;

  const handleAdd = (draft: Draft) => {
    const next: Restaurant = { ...draft, id: makeId(), selected: true };
    setRestaurants((rs) => [...rs, next]);
  };

  const handleUpdate = (id: string, draft: Draft) => {
    setRestaurants((rs) =>
      rs.map((r) => (r.id === id ? { ...r, ...draft } : r)),
    );
    setEditingId(null);
  };

  const handleToggleSelect = (id: string) => {
    setRestaurants((rs) =>
      rs.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    );
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDelete = (id: string) => {
    setRestaurants((rs) => rs.filter((r) => r.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleCancelEdit = () => setEditingId(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
          <SectionCard
            step={1}
            emoji="📝"
            title="前提条件を入力"
            description="どんな飲み会か、ざっくり入力してください。詳細は折りたたみから。"
          >
            <ConditionForm value={condition} onChange={setCondition} />
          </SectionCard>

          <div ref={formRef}>
            <SectionCard
              step={2}
              emoji="🍻"
              title={editingRestaurant ? "候補店を編集" : "候補店を追加"}
              description={
                editingRestaurant
                  ? `「${editingRestaurant.name}」を編集中`
                  : "見つけたお店をどんどん追加していきましょう。"
              }
            >
              <RestaurantForm
                editing={editingRestaurant}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onCancelEdit={handleCancelEdit}
              />
            </SectionCard>
          </div>

          <SectionCard
            emoji="✅"
            title="候補リスト"
            description="提案文に含めたい候補店をチェック。"
          >
            <RestaurantList
              restaurants={restaurants}
              onToggleSelect={handleToggleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </SectionCard>

          <SectionCard
            step={3}
            emoji="✨"
            title="提案文を生成"
            description="トーンに合わせて、そのまま貼れる提案文を生成します。"
          >
            <ProposalPanel
              condition={condition}
              restaurants={restaurants}
            />
          </SectionCard>

          <p className="pt-2 pb-8 text-center text-xs text-nomiris-textSub">
            🐿️ 飲みリス — データはこの端末の localStorage にのみ保存されます。
          </p>
        </div>
      </main>
    </div>
  );
}
