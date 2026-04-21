import { Injectable } from "@nestjs/common";
import { NotificationStatus } from "@prisma/client";
import nodemailer from "nodemailer";
import { PrismaService } from "../prisma/prisma.service";

type EmailPayload = {
  notificationId: string;
  deliveryId: string;
  recipientEmail: string;
  subject: string;
  body: string;
};

@Injectable()
export class EmailDeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async deliverEmail(payload: EmailPayload) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM ?? process.env.ADMIN_EMAIL ?? "admin@lms.local";
    const secure = String(process.env.SMTP_SECURE ?? "false") === "true";

    if (!host) {
      await this.markDeliveryFailed(
        payload.deliveryId,
        payload.notificationId,
        "SMTP_HOST is not configured",
      );
      return {
        delivered: false,
        reason: "SMTP_HOST is not configured",
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth:
        user && pass
          ? {
              user,
              pass,
            }
          : undefined,
    });

    try {
      const result = await transporter.sendMail({
        from,
        to: payload.recipientEmail,
        subject: payload.subject,
        text: payload.body,
      });

      await this.prisma.emailDelivery.update({
        where: {
          id: payload.deliveryId,
        },
        data: {
          status: NotificationStatus.SENT,
          provider: "smtp",
          providerRef: result.messageId,
          sentAt: new Date(),
          errorMessage: null,
        },
      });

      await this.prisma.notification.update({
        where: {
          id: payload.notificationId,
        },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });

      return {
        delivered: true,
        providerRef: result.messageId,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown SMTP delivery error";

      await this.markDeliveryFailed(
        payload.deliveryId,
        payload.notificationId,
        message,
      );

      return {
        delivered: false,
        reason: message,
      };
    }
  }

  private async markDeliveryFailed(
    deliveryId: string,
    notificationId: string,
    message: string,
  ) {
    await this.prisma.emailDelivery.update({
      where: {
        id: deliveryId,
      },
      data: {
        status: NotificationStatus.FAILED,
        provider: "smtp",
        errorMessage: message,
      },
    });

    await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: NotificationStatus.FAILED,
      },
    });
  }
}
