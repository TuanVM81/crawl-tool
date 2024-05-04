import { Body, Controller, Get, Post } from '@nestjs/common';
import { CrawlPngImageDto } from 'src/app.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('crawl-images')
  crawlPngImages(@Body() dto: CrawlPngImageDto) {
    console.log("dto: ", dto);
    return this.appService.doBatch(dto.domain, dto.originalUrls, dto.keyWords, dto.fileName);
  }
}
