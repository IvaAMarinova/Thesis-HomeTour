import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  Matches,
  IsInt,
  MaxLength,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
  IsPositive,
  IsDefined,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString({ message: 'City must be a string' })
  city!: string;

  @IsString({ message: 'Street must be a string' })
  street!: string;

  @IsString({ message: 'Neighborhood must be a string' })
  neighborhood: string;
}

class ResourcesDto {
  @IsString({ message: 'Header image must be a string or null' })
  headerImage!: string | null;

  @IsArray({ message: 'Gallery images must be an array of strings' })
  @ArrayMaxSize(10, {
    message: 'Gallery images can have a maximum of 10 images',
  })
  @IsString({ each: true, message: 'Each gallery image must be a string' })
  galleryImages!: string[];

  @IsOptional()
  @IsString({ message: 'Visualization folder must be a string or null' })
  visualizationFolder?: string | null;
}

export class PropertyInputDto {
  @IsString({ message: 'Property name must be a string' })
  name!: string;

  @IsString({ message: 'Property description must be a string' })
  @MinLength(64, { message: 'Description must be at least 64 characters long' })
  @MaxLength(2048, {
    message: 'Description must be at most 256 characters long',
  })
  description!: string;

  @ValidateIf((obj) => obj.floor !== null)
  @Type(() => Number)
  @IsInt({ message: 'Floor must be an integer' })
  @IsPositive({ message: 'Floor must be a positive number' })
  floor: number | null;

  @IsString()
  @Matches(/^\+?\d[\d\s]{8,15}$/, { message: 'Invalid phone number.' })
  phoneNumber!: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => ResourcesDto)
  resources!: ResourcesDto;

  @IsString({ message: 'Company ID must be a string' })
  company!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}
