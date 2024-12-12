import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

function ImagesCarousel({ galleryImages }: { galleryImages: Record<string, string>[] }) {


    return (
        <Carousel className="relative w-full max-w-6xl mx-auto">
            <CarouselPrevious className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-20" />
            <CarouselContent className="-ml-1 p-3">
                {galleryImages.map((image, index) => (
                    <CarouselItem
                        key={index}
                        className="pl-1 basis-full sm:basis-1/2 md:basis-1/3 transform transition-transform duration-300 hover:scale-105"
                    >
                        <div className="p-1">
                            <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6 transform transition-transform duration-300 hover:scale-105">
                                    <img
                                        src={image.url}
                                        alt={`Property image ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>

            <CarouselNext className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-20" />
        </Carousel>

    );
}

export default ImagesCarousel;