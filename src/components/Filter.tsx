// src/components/Filter.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Filter({ onSelectCategories }: { onSelectCategories: (id: string | null) => void }) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded-md border">
      <h3 className="font-bold text-lg mb-3">Categorías</h3>
      <button
        onClick={() => onSelectCategories(null)}
        className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-100"
      >
        Todas
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelectCategories(c.id)}
          className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-100"
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
