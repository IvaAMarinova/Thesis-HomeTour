import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "@mynaui/icons-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function ImagesCarousel({
  galleryImages,
}: {
  galleryImages: Record<string, string>[];
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageToShow, setImageToShow] = useState<string>("");
  const imagesCount = galleryImages.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  return (
    <div ref={carouselRef} className="relative w-full max-w-6xl mx-auto">
      {isVisible && (
        <Carousel className="relative z-10">
          {imagesCount > 3 && (
            <CarouselPrevious className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-10" />
          )}
          <CarouselContent className="-ml-1 p-3">
            {galleryImages.map((image, index) => (
              <CarouselItem
                key={index}
                className="pl-1 basis-full sm:basis-1/2 md:basis-1/3 transform transition-transform duration-300 hover:scale-105"
                onClick={() => {
                  setImageToShow(image.url);
                  setShowImageModal(true);
                }}
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
          {imagesCount > 3 && (
            <CarouselNext className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-10" />
          )}
        </Carousel>
      )}

      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="bg-white p-10 rounded-lg shadow-lg max-w-4xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-black text-lg font-bold"
              onClick={() => setShowImageModal(false)}
            >
              <X />
            </button>
            <img
              src={imageToShow}
              alt="Selected property image"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImagesCarousel;
