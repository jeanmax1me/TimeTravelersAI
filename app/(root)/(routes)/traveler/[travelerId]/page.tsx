import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { TravelerForm } from "./components/traveler-form";

interface TravelerIdPageProps {
    params: {
        travelerId: string;
    };
};

const TravelerIdPage = async ({params}: TravelerIdPageProps) => {
   const { userId } = auth();

   if (!userId) {
    return redirectToSignIn();
   }

const traveler = await prismadb.traveler.findUnique({
    where: {
        id: params.travelerId,
        userId
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