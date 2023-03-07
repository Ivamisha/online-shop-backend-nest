import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import { ConfigI } from 'src/config/config';
import { User } from '../user/user.model';

@Injectable()
export class MailSenderService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService<ConfigI>,
  ) {}

  async sendUserConfirm(user: User, activationLink: string, i18n: I18nContext) {
    const confirmHost = this.configService.get('CONFIRM_URL');
    const url = confirmHost + activationLink;

    const i18nLang = i18n.lang;
    const subject = i18n.translate('mail.CONFIRM_EMAIL.title');

    await this.mailerService.sendMail({
      to: user.email,
      subject,
      template: './confirm',
      context: {
        user,
        url,
        i18nLang,
      },
    });
  }

  async sendUserNotice(user: User, i18n: I18nContext) {
    const i18nLang = i18n.lang;
    const subject = i18n.translate('mail.USER_NOTICE.title');

    await this.mailerService.sendMail({
      to: user.email,
      subject,
      template: './attention',
      context: {
        user,
        i18nLang,
      },
    });
  }

  async sendUserRestore(user: User, activationLink: string, i18n: I18nContext) {
    const confirmHost = this.configService.get('CONFIRM_URL');
    const url = confirmHost + activationLink;

    const i18nLang = i18n.lang;
    const subject = i18n.translate('mail.USER_RESTORE.title');

    await this.mailerService.sendMail({
      to: user.email,
      subject,
      template: './restore',
      context: {
        user,
        url,
        i18nLang,
      },
    });
  }
}
