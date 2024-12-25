import { IsOptional, IsBoolean } from 'class-validator';

export class UserPropertyPartialInputDto {
    @IsOptional()
    @IsBoolean({ message: 'Liked must be a boolean' })
    liked?: boolean;
}