import { Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailSenderService } from './mail-sender.service';
import { I18nModule, I18nService } from 'nestjs-i18n';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService, i18n: I18nService) => ({
        transport: {
          host: config.get('smtpHost'),
          port: config.get('smtpPort'),
          secure: false,
          auth: {
            user: config.get('smtpUser'),
            pass: config.get('smtpPassword'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: '"No Reply"<noreply@gmail.com>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService, I18nService],
    }),
  ],
  providers: [MailSenderService],
  exports: [MailSenderService],
})
export class MailModule {}
