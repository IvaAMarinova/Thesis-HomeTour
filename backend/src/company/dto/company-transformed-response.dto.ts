export class TransformedCompanyDto {
    name: string;
    description: string;
    phoneNumber: string;
    email: string;
    website: string;
    resources: {
        logoImage: { key: string; url: string };
        galleryImage: { key: string; url: string };
    };

    constructor(company: {
        name: string;
        description: string;
        phoneNumber: string;
        email: string;
        website: string;
        resources: {
            logoImage: { key: string; url: string };
            galleryImage: { key: string; url: string };
        };
        }) {
        this.name = company.name;
        this.description = company.description;
        this.phoneNumber = company.phoneNumber;
        this.email = company.email;
        this.website = company.website;
        this.resources = company.resources;
    }
}