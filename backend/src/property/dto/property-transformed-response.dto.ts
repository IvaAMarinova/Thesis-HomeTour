export class TransformedPropertyDto {
    id: string;
    name: string;
    description: string;
    floor?: number;
    address: Record<string, string>;
    phoneNumber: string;
    email: string;
    company: string;
    building?: string;
    resources?: {
        headerImage?: { key: string; url: string } | null;
        galleryImages?: { key: string; url: string }[];
        visualizationFolder?: string | null;
    };
}