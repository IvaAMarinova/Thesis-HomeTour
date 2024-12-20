import Resizer from 'react-image-file-resizer';

const HEADER_IMAGE_SIZE_X = 512;
const HEADER_IMAGE_SIZE_Y = 1024;
const GALLERY_IMAGE_SIZE = 512;

const resizeFile = (file: File, type: string): Promise<Blob> => 
    new Promise((resolve, reject) => {
        const sizeX = type === 'header' ? HEADER_IMAGE_SIZE_X : GALLERY_IMAGE_SIZE;
        const sizeY = type === 'header' ? HEADER_IMAGE_SIZE_Y : GALLERY_IMAGE_SIZE;
        Resizer.imageFileResizer(
            file,
            sizeY,
            sizeX,
            "JPEG",
            100,
            0,
            (uri) => {
                if (uri instanceof Blob) {
                    resolve(uri);
                } else {
                    console.error("Resized file is not a Blob.");
                    reject(new Error("Failed to resize image."));
                }
            },
            "blob"
        );
    });


export default resizeFile;