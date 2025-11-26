import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export default function Filter({ onSelectCategory }: { onSelectCategory: (id: number | null) => void }) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("category").select("*");
      if (!error) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded-md border">
      <h3 className="font-bold text-lg mb-3">Categorías</h3>

      <button
        onClick={() => onSelectCategory(null)}
        className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-100"
      >
        Todas
      </button>

      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelectCategory(c.id)}
          className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-100"
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
