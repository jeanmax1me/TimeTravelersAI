import { SearchInput } from "@/components/search-input";
import { UserButton } from "@clerk/nextjs/app-beta";
import prismadb from "@/lib/prismadb";
import { Categories } from "@/components/categories";
import { Travelers } from "@/components/travelers";

interface RootPageProps {
  searchParams: {
    categoryId: string;
    name: string;
  }
}


const RootPage  = async ({searchParams}: RootPageProps) => {
 const data = await prismadb.traveler.findMany({ 
  where: {
    categoryId: searchParams.categoryId,
    name: {
      search: searchParams.name
    }
  },
  orderBy: {
    createdAt: "desc",
  },
include: {
  _count: {
    select: {
      messages: true
    }
  }
}
 })
 
 
  const categories = await prismadb.category.findMany();
   
   return ( 
        <div className="h-full p-4 space-y-2">
          <SearchInput   />
          <Categories data={categories} />
          <Travelers data={data} />
        </div>
     );
}
 
export default RootPage;