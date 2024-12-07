import { useEffect, useState } from 'react';
import { HttpService } from '../../services/http-service';

function Visualization({ visualizationFolder }: { visualizationFolder: string }) {
  const [s3Url, setS3Url] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchS3Url = async () => {
      try {
        const response = await HttpService.get<Record<string, string>>(
          `/get-presigned-url/to-view?key=${visualizationFolder}`, undefined, false
        );
        if (response.url) {
          setS3Url(response.url);
          setError(false);
        } else {
          setS3Url(null);
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching S3 URL:', error);
        setError(true);
      }
    };

    fetchS3Url();
  }, [visualizationFolder]);

  if (!s3Url || error) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mt-8 mb-4">
        <h1 className="text-3xl font-bold p-3">Step inside and explore this property...</h1>
        <p className="text-xl p-1">Use your mouse and keys to move around the property.</p>
        <p className="text-xl p-1">Use the fullscreen button to look around better.</p>
      </div>
      <div className="w-full max-w-5xl p-4">
        <iframe
          src={s3Url}
          title="Unity Game"
          className="w-[1000px] h-[750px] rounded-lg border-none"
          style={{ overflow: 'hidden' }}
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default Visualization;