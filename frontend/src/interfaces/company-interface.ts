export default interface Company {
  id: string;
  name: string;
  description: string;
  email: string;
  phoneNumber: string;
  website: string;
  resources: {
    logoImage?: { key: string; url: string };
    galleryImage?: { key: string; url: string };
  };
}
