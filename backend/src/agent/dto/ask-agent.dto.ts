import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AskAgentDto {
  @ApiProperty({
    description: 'The KQL query or message to autocomplete',
    example: 'StormEvents | where ',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Kusto cluster name (without the full URL)',
    example: 'help',
  })
  @IsString()
  @IsNotEmpty()
  clusterName: string;

  @ApiProperty({
    description: 'Database name within the Kusto cluster',
    example: 'Samples',
  })
  @IsString()
  @IsNotEmpty()
  databaseName: string;
}
