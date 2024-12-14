import { IsString, IsEmail, IsDefined, MinLength, Matches, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ResourcesDto {
    @IsString({ message: 'Logo image must be a string or null' })
    logoImage: string;

    @IsString({ message: 'Gallery image must be a string' })
    galleryImage: string;
}

export class CompanyInputDto {
    @IsString({ message: 'Property name must be a string' })
    name!: string;

    @IsEmail({}, { message: 'Invalid email address' })
    email!: string;

    @IsString()
    @Matches(/^\+?\d[\d\s]{8,14}$/, {
        message: 'Invalid phone number.',
    })
    phoneNumber!: string;

    @IsString({ message: 'Property name must be a string' })
    @MinLength(64, { message: 'Description must be at least 64 characters long' })
    @MaxLength(2048, { message: 'Description must be at most 256 characters long' })
    description!: string;

    @IsString()
    @IsUrl({}, { message: 'Website must be a valid url.' })
    website!: string;

    @IsDefined()
    @ValidateNested()
    @Type(() => ResourcesDto)
    resources!: ResourcesDto;// validate(): void { //     if (!this.resources) {
}