export class TransformedCompanyDto {
    id: string;
    name: string;
    description: string;
    phoneNumber: string;
    email: string;
    website: string;
    resources?: {
        logoImage?: { key: string; url: string } | null;
        galleryImage?: { key: string; url: string };
    };
}