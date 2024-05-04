import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as fs from "fs";

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async doBatch(domain: string, originalURls: string[], keyWords: string[], fileName = 'result.txt') {

    const filePath = `public`;
    const fileDirectory = filePath + "/" + fileName;

    this.createDirIfNotExists(filePath);

    // we start with an empty url array, and add newly crawled ones to that
    let urls: string[] = originalURls;
  
    // array to remember the already processed urls, to not cover them twice
    const processedURLs: { [index: string]: boolean } = {};
  
    // json results object to write towards mustache at the end
    // let results: Array<{ url: string; items: string[] }> = [];
    let isFirst = true;
  
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      timeout: 10000,
      headless: false,
    });
    const page = await browser.newPage();
  
    while (urls.length > 0) {
      const url = urls.shift() || "";
      if (processedURLs[url]) {
        continue;
      }
      processedURLs[url] = true;
      console.log("Processing: " + url);
  
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  
        const links = await page.$$eval(
          'a',
          (els, keyWords, domain) =>
            els
              .map((e) => e.href as string)
              .filter(
                (e) =>
                  e.includes(new URL(domain).hostname) &&
                  keyWords.some((keyWord) => e.includes(keyWord)),
              ),
          keyWords,
          domain,
        );
        urls = urls.concat(links.filter((link) => !processedURLs[link]));
  
        const images = await page.$$eval('img,[data-bgimage]', (imgs) =>
          imgs.map((img) => ({
            src: img.getAttribute('src'),
            dataSrc: img.getAttribute('data-src'),
            dataBgImage: img.getAttribute('data-bgimage'),
          })),
        );
  
        for (const image of images) {
          const {dataSrc, src, dataBgImage} = image;

          let finalSrc = "";

          if (dataSrc && this.isNotWebPSvgGif(dataSrc)) {
            finalSrc = dataSrc;
          }  else if (dataBgImage && this.isNotWebPSvgGif(dataBgImage)) {
            finalSrc = dataBgImage;
          } else if (src && this.isNotWebPSvgGif(src)) {
            finalSrc = src;
          }

          if (finalSrc) {
            if (isFirst) {
              fs.appendFileSync(fileDirectory, `- ${url}\n`);
              isFirst = false;
            }
            fs.appendFileSync(fileDirectory, `\t + ${finalSrc}\n`);
          }
        }

        isFirst = true;
      } catch (error) {
        console.log(error);
      }
    }
  
    await page.close();
    await browser.close();
  
  }  

  isNotWebPSvgGif(src: string): boolean {
    // Create a regular expression pattern to match the file extension
    const pattern = /\.(webp|svg|gif)$/i;
  
    // Check if the src string matches the pattern
    return !pattern.test(src);
  }

  createDirIfNotExists(dir: string) {
    !fs.existsSync(dir) ? fs.mkdirSync(dir, {recursive: true}) : undefined;
  }
}
