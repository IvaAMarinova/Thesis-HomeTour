export class UserPropertyResponseDto {
    userId: string;
    propertyId: string;
    liked: boolean;
    
    constructor(userProperty: { user: { id: string }; property: { id: string }; liked: boolean }) {
        this.userId = userProperty.user.id;
        this.propertyId = userProperty.property.id;
        this.liked = userProperty.liked;
    }
}