import { useEffect, useState } from "react";
import { HttpService } from "../../services/http-service";

function Visualization({
  visualizationFolder,
}: {
  visualizationFolder: string;
}) {
  const [s3Url, setS3Url] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const fetchS3Url = async () => {
      try {
        const response = await HttpService.get<Record<string, string>>(
          `/files/to-view?key=${visualizationFolder}`,
        );
        if (response.url) {
          setS3Url(response.url);
          setError(false);
        } else {
          setS3Url(null);
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching S3 URL:", error);
        setError(true);
      }
    };

    fetchS3Url();
  }, [visualizationFolder]);

  if (!s3Url || error) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mt-8 mb-4">
        <h1 className="text-3xl font-bold p-3">
          Стъпи вътре в имота и разгледай как изглежда...
        </h1>
        {!isSmallScreen && (
          <div>
            <p className="text-xl p-1 mb-3">
              Използвай своята мишка и клавиатура, за да се разходиш.
            </p>
            <p className="text-md p-1">
              Използвай бутона "Fullscreen", за да уголемиш екрана.
            </p>
            <p className="text-md p-1">
              За да излезеш от екрана на разходката, натисни клавиш "Esc" и
              цъкни извън него.
            </p>
          </div>
        )}
      </div>
      <div
        className="relative w-full max-w-full overflow-hidden flex justify-center"
        style={{ height: "750px" }}
      >
        <iframe
          src={s3Url}
          title="Unity Game"
          className="absolute top-0 left-1/2 transform -translate-x-1/2"
          style={{ width: "1000px", height: "750px" }}
          allowFullScreen
        />
      </div>
      {isSmallScreen && (
        <p className="text-md p-1 text-center mt-8">
          Подсказка - разходката е по-лесна и удобна за навигация на по-голям
          екран :)
        </p>
      )}
    </div>
  );
}

export default Visualization;
