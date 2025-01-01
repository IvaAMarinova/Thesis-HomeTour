import { IsString, MinLength } from 'class-validator';

export class PartialUserInputDto {
    @IsString()
    @MinLength(2, { message: 'Full name must be at least 2 characters long' })
    fullName!: string;
}