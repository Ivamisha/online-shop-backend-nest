import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { MediaService } from '../media/media.service';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get('/image/:id')
  async getImage(@Param() param, @Res() res: Response) {
    try {
      const file = await this.mediaService.getImagePath(param.id);
      file.pipe(res);
    } catch (err) {
      return { error: err.message };
    }
  }
}
