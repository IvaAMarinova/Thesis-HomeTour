export class TransformedPropertyDto {
    id: string;
    name: string;
    description: string;
    floor: number;
    address: { street: string; city: string; neighborhood: string };
    phoneNumber: string;
    email: string;
    company: string;
    resources: {
        headerImage: { key: string; url: string } | null;
        galleryImages: { key: string; url: string }[];
        visualizationFolder?: string | null;
    };
    building?: string;

    constructor(property: {
        id: string;
        name: string;
        description: string;
        floor: number;
        address: { street: string; city: string; neighborhood: string };
        phoneNumber: string;
        email: string;
        company: string;
        resources: {
            headerImage: { key: string; url: string } | null;
            galleryImages: { key: string; url: string }[];
            visualizationFolder?: string | null;
        };
        building?: string;
    }) {
        this.id = property.id;
        this.name = property.name;
        this.description = property.description;
        this.floor = property.floor;
        this.address = property.address;
        this.phoneNumber = property.phoneNumber;
        this.email = property.email;
        this.company = property.company;
        this.resources = property.resources;
        this.building = property.building;
    }
}