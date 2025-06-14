import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HttpService } from "../../services/http-service";
import ImagesCarousel from "../../components/property/images-carousel";
import GoBackButton from "@/components/go-back-button";
import ContactCompanyBox from "../../components/property/contact-company-box";
import Visualization from "@/components/property/visualization";
import GoUpButton from "../../components/go-up-button";
import {
  Heart,
  HeartSolid,
  TelephoneCall,
  Envelope,
} from "@mynaui/icons-react";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Property from "@/interfaces/property-interface";
import Map from "@/components/map";

function PropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userId, fetchUserId } = useUser();
  const [isLiked, setIsLiked] = useState(false);

  const {
    data: property,
    isLoading: isPropertyLoading,
    isError: isPropertyError,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const response = await HttpService.get<Property>(`/properties/${id}`);
      return response;
    },
    enabled: !!id,
  });

  const { isLoading: isAuthLoading } = useQuery({
    queryKey: ["isAuthenticated"],
    queryFn: async () => {
      try {
        const authenticated = await HttpService.isAuthenticated(fetchUserId);
        return authenticated;
      } catch (error) {
        return false;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!userId || !id) return;

    const fetchLikedProperties = async () => {
      try {
        const likedResponse = await HttpService.get<Record<string, string>[]>(
          `/user-properties/users/${userId}/liked-properties`,
          undefined,
          true
        );
        const isLikedProperty = likedResponse.some(
          (likedItem) => likedItem.propertyId === id
        );
        setIsLiked(isLikedProperty);
      } catch (error) {
        console.error("Error fetching liked properties:", error);
      }
    };

    fetchLikedProperties();
  }, [userId, id]);

  const handleToggleLike = async () => {
    if (!userId) return;

    try {
      const newLikedState = !isLiked;

      await HttpService.put(
        `/user-properties/user-id/${userId}`,
        {
          liked: newLikedState,
          property: id,
          user: userId,
        },
        undefined,
        true,
        false
      );

      setIsLiked(newLikedState);
      console.log(
        `Property ${newLikedState ? "liked" : "unliked"} successfully.`
      );
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  if (isAuthLoading || isPropertyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size={48} className="mt-20" />
      </div>
    );
  }

  if (isPropertyError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Получи се грешка. Опитайте пак по-късно.</p>
      </div>
    );
  }

  return (
    <div className="pt-16 align-middle flex flex-col items-center">
      <div className="relative p-9 w-full max-w-6xl mx-auto lg:border md:border rounded-lg lg:mt-10">
        <div className="self-start ml-4 mt-6">
          <GoBackButton onClick={() => navigate(-1)} />
        </div>
        {property ? (
          <div>
            {userId && (
              <div className="absolute top-4 right-4">
                <div
                  className="p-3 border rounded-full mt-10 lg:mt-1 shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105"
                  onClick={handleToggleLike}
                >
                  {isLiked ? (
                    <HeartSolid className="w-6 h-6" />
                  ) : (
                    <Heart className="w-6 h-6" />
                  )}
                </div>
              </div>
            )}

            {property?.resources?.headerImage?.url && (
              <div className="h-64 mt-10 overflow-hidden rounded-xl shadow-md">
                <img
                  src={property.resources.headerImage.url}
                  alt="Property header image"
                  className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}

            <div className="flex flex-col md:flex-row sm:flex-row mt-10 w-full max-w-6xl mx-auto px-4">
              <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto mt-4 mb-10">
                <div className="flex-1 md:basis-1/2 p-4">
                  <h1 className="text-3xl font-bold mb-4 text-center md:text-left">
                    {property.name}
                  </h1>

                  <div className="max-w-96 overflow-hidden text-ellipsis">
                    {property.description
                      ?.split("\n")
                      .map((paragraph: string, index: number) => (
                        <p
                          key={index}
                          className="mb-4 text-justify"
                          style={{
                            textIndent: "2em",
                          }}
                        >
                          {paragraph}
                        </p>
                      ))}
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-2">
                      Адрес на имота
                    </h2>
                    <p>
                      {[
                        property.address?.city,
                        property.address?.neighborhood,
                        property.address?.street,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <h2 className="text-md font-semibold mt-4">Етаж</h2>
                    <p>{property.floor}</p>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-md font-semibold mb-2">
                      За повече информация за този обект потърси:
                    </h3>
                    <div className="flex flex-row items-center gap-2 mb-1">
                      <TelephoneCall className="h-5" />
                      {property.phoneNumber}
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <Envelope className="h-5" />
                      {property.email}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center md:flex-shrink-0 md:basis-1/2 p-4 w-full md:w-auto">
                  <div className="w-96">
                    <ContactCompanyBox
                      company={property.companyId}
                      onClick={() =>
                        navigate(`/companies/${property.companyId}`)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border shadow-md h-80 w-full max-w-6xl mx-auto p-4">
              <Map
                street={property.address.street}
                city={property.address.city}
                neighborhood={property.address.neighborhood}
              />
            </div>

            <div className="w-full max-w-6xl mx-auto px-4 mt-4">
              {property?.resources?.galleryImages &&
                property?.resources?.galleryImages?.length > 0 && (
                  <ImagesCarousel
                    galleryImages={property.resources.galleryImages}
                  />
                )}
            </div>

            <div className="w-full max-w-6xl mx-auto px-4">
              {property?.resources?.visualizationFolder && (
                <Visualization
                  visualizationFolder={property.resources.visualizationFolder}
                />
              )}
            </div>
            <GoUpButton />
          </div>
        ) : (
          <div className="flex items-center justify-center h-16">
            <p className="text-center">
              За момента не можем да визуализираме този имот. Пробвайте пак
              по-късно!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyPage;
