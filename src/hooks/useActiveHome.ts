"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useActiveHome() {
  const homesQuery = useQuery(api.homes.getUserHomes, {});

  const homes = homesQuery ?? [];

  const activeHome = useMemo(() => {
    if (homes.length === 0) return null;
    return homes[0];
  }, [homes]);

  return {
    homes,
    activeHome,
    isLoading: homesQuery === undefined,
  };
}
