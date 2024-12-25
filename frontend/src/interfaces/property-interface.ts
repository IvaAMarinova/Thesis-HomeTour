export default interface Property {
    floor: string;
    address: Record<string, string>;
    phoneNumber: string;
    email: string;
    name: string;
    description: string;
    resources: {
        headerImage?: { key: string; url: string };
        galleryImages?: { key: string; url: string }[];
        vizualizationFolder?: string;
    };
}