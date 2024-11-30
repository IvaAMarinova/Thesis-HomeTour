export class TransformedCompanyDto {
    id: string;
    name: string;
    description: string;
    phoneNumber: string;
    email: string;
    website: string;
    resources?: {
        logoImage?: { key: string; url: string } | null;
        galleryImages?: { key: string; url: string }[];
    };
}