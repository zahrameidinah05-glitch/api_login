import { Injectable, Logger } from '@nestjs/common';

/**
 * Pengirim email. Saat ini hanya menulis ke log karena belum ada SMTP.
 * Untuk produksi, ganti isi `sendPasswordReset` dengan pengiriman email
 * sungguhan (mis. nodemailer / layanan email transaksional).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  sendPasswordReset(email: string, token: string, expiresInMinutes: number) {
    if (process.env.NODE_ENV === 'production') {
      // Jangan pernah mencetak token di log produksi.
      this.logger.warn(
        `Pengiriman email belum dikonfigurasi; reset password untuk ${email} tidak terkirim`,
      );
      return;
    }
    this.logger.log(
      `[DEV] Token reset password untuk ${email}: ${token} (berlaku ${expiresInMinutes} menit)`,
    );
  }
}
