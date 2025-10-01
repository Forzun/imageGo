"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Dashboard(){
    const router = useRouter();

    function navigate(){
        router.push("/dashboard/picture/1");
    }

    return <div className="max-w-[1400px] mx-auto w-full h-screen "> 
         <Button onClick={() => navigate()}>Edit</Button> 
    </div>
}

