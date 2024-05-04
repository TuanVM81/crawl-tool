import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CrawlPngImageDto {
  @ApiProperty({ default: "https://aniday.com"})
  domain: string;

  @ApiProperty({type: [String], default: [
    "https://aniday.com/en/app-store",
    "https://aniday.com/vi/app-store",
    "https://aniday.com/id/app-store"
  ]})
  originalUrls: string[];

  @ApiProperty({type: [String], default: [
    "app-store"
  ]})
  keyWords: string[];

  @ApiPropertyOptional({default: "app-ai-store.txt"})
  fileName?: string;
}