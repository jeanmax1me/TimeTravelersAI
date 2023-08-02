"use client";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoriesProps {
  data: Category[];
}

export const Categories = ({ data }: CategoriesProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

const categoryId = searchParams.get("categoryId");

const onClick = (id: string | undefined) => {
    const query = {categoryId : id};
}

  return (
    <div className="w-full overflow-x-auto space-x-2 flex p-1">
      <button
        className={cn(`
       flex items-center text-center text-xs md:text-sm px-2 md:px-4 py-2 md:py-3
       rounded-md bg-primary/10 hover:opacity-75 transition`)}
      >
     Newest
      </button>
      {data.map((item) => (
        <button key={item.id}
        className={cn(`
       flex items-center text-center text-xs md:text-sm px-2 md:px-4 py-2 md:py-3
       rounded-md bg-primary/10 hover:opacity-75 transition`)}
      > {item.name} </button>
       ))}
       </div>
  )
};
