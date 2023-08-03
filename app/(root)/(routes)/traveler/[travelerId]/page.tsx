import prismadb from "@/lib/prismadb";
import TravelerForm from "./components/traveler-form";

interface TravelerIdPageProps {
    params: {
        travelerId: string;
    };
};

const TravelerIdPage = async ({params}: TravelerIdPageProps) => {
    // TODO : check premium user

const traveler = await prismadb.traveler.findUnique({
    where: {id: params.travelerId,
    }
})

const categories = await prismadb.category.findMany();

    return ( 
<TravelerForm
initialData={traveler}
categories={categories}
/>
     );
}
 
export default TravelerIdPage ;