import { Hero } from "./_components/hero";
import { Features } from "./_components/features";
import { Testimonials } from "./_components/testimonials";

export default function Home (){
    return(
        <div className="flex flex-col min-h-screen">
            <div>
                <Hero/>
                <Features/>
                <Testimonials/>
            </div>
        </div>
    )
}