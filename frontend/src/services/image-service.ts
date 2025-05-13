import Resizer from "react-image-file-resizer";

const HEADER_IMAGE_SIZE_X = 512;
const HEADER_IMAGE_SIZE_Y = 1024;
const GALLERY_IMAGE_SIZE = 512;
const LOGO_IMAGE_SIZE = 128;

const resizeFile = (file: File, type: string): Promise<Blob> =>
  new Promise((resolve, reject) => {
    let sizeX, sizeY;

    switch (type) {
      case "header":
        sizeX = HEADER_IMAGE_SIZE_X;
        sizeY = HEADER_IMAGE_SIZE_Y;
        break;
      case "gallery":
        sizeX = GALLERY_IMAGE_SIZE;
        sizeY = GALLERY_IMAGE_SIZE;
        break;
      case "logo":
        sizeX = LOGO_IMAGE_SIZE;
        sizeY = LOGO_IMAGE_SIZE;
        break;
      default:
        throw new Error("Invalid type provided.");
    }

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
          reject(new Error("Failed to resize image."));
        }
      },
      "blob",
    );
  });

export default resizeFile;
