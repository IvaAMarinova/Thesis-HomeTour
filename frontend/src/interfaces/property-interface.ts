export default interface Property {
    id: string;
    floor: string;
    address: {
        city: string;
        neighborhood: string;
        street: string;
    }
    phoneNumber: string;
    email: string;
    name: string;
    description: string;
    resources: {
        headerImage?: { key: string; url: string };
        galleryImages?: { key: string; url: string }[];
        visualizationFolder?: string;
    };
    companyId: string;
    companyName?: string;
}