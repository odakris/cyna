// /app/test/page.ts
"use client";

import { useState } from "react";

export default function Test() {
  const [sortOption, setSortOption] = useState<string>("nom-asc");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test du menu</h1>
      <div className="mb-4">
        <label htmlFor="sort" className="mr-2 font-medium text-gray-700">
          Trier par :
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="p-2 border rounded-md bg-white shadow-sm text-gray-900"
        >
          <option value="nom-asc">Nom (A-Z)</option>
          <option value="nom-desc">Nom (Z-A)</option>
          <option value="prix_unitaire-asc">Prix (croissant)</option>
          <option value="prix_unitaire-desc">Prix (décroissant)</option>
        </select>
      </div>
      <p>Sélection actuelle : {sortOption}</p>
    </div>
  );
}