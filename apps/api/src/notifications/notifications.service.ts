import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from "@prisma/client";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { CreateNotificationTemplateDto } from "./dto/create-notification-template.dto";
import { SendPracticeDemonstrationDto } from "./dto/send-practice-demonstration.dto";

const notificationInclude = Prisma.validator<Prisma.NotificationInclude>()({
  template: true,
  emailDeliveries: true,
});

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(user: JwtPayload) {
    return this.prisma.notification.findMany({
      where: {
        institutionId: user.institutionId,
        userId: user.sub,
      },
      include: notificationInclude,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async markAsRead(notificationId: string, user: JwtPayload) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.institutionId !== user.institutionId) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.userId !== user.sub) {
      throw new ForbiddenException("User cannot modify this notification");
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
        status:
          notification.channel === NotificationChannel.IN_APP
            ? NotificationStatus.READ
            : notification.status,
      },
    });
  }

  findTemplates(user: JwtPayload) {
    return this.prisma.notificationTemplate.findMany({
      where: {
        institutionId: user.institutionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createTemplate(dto: CreateNotificationTemplateDto, user: JwtPayload) {
    if (!["ADMIN", "SUPPORT"].some((role) => user.roles.includes(role))) {
      throw new ForbiddenException("Only admin or support can create templates");
    }

    const template = await this.prisma.notificationTemplate.create({
      data: {
        institutionId: user.institutionId,
        key: dto.key,
        name: dto.name,
        subjectEs: dto.subjectEs,
        subjectEn: dto.subjectEn,
        bodyEs: dto.bodyEs,
        bodyEn: dto.bodyEn,
        channel: dto.channel ?? NotificationChannel.BOTH,
        isActive: dto.isActive ?? true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: "NOTIFICATION_TEMPLATE_CREATED",
        entityType: "NotificationTemplate",
        entityId: template.id,
        meta: {
          key: template.key,
          channel: template.channel,
        } as Prisma.InputJsonValue,
      },
    });

    return template;
  }

  async createNotification(dto: CreateNotificationDto, user: JwtPayload) {
    if (!["ADMIN", "TEACHER", "SUPPORT"].some((role) => user.roles.includes(role))) {
      throw new ForbiddenException("User cannot create notifications");
    }

    const recipients = await this.prisma.userInstitution.findMany({
      where: {
        institutionId: user.institutionId,
        userId: {
          in: dto.recipientUserIds,
        },
      },
      include: {
        user: true,
      },
    });

    if (recipients.length !== dto.recipientUserIds.length) {
      throw new BadRequestException(
        "All recipients must belong to the active institution",
      );
    }

    const created = await this.prisma.$transaction(
      recipients.map((recipient) =>
        this.prisma.notification.create({
          data: {
            institutionId: user.institutionId,
            userId: recipient.userId,
            templateId: dto.templateId,
            channel: dto.channel ?? NotificationChannel.IN_APP,
            status:
              (dto.channel ?? NotificationChannel.IN_APP) === NotificationChannel.IN_APP
                ? NotificationStatus.SENT
                : NotificationStatus.PENDING,
            title: dto.title,
            body: dto.body,
            entityType: dto.entityType,
            entityId: dto.entityId,
            sentAt:
              (dto.channel ?? NotificationChannel.IN_APP) === NotificationChannel.IN_APP
                ? new Date()
                : undefined,
            emailDeliveries:
              (dto.channel ?? NotificationChannel.IN_APP) === NotificationChannel.IN_APP
                ? undefined
                : {
                    create: {
                      recipientEmail: recipient.user.email,
                      subject: dto.title,
                      body: dto.body,
                      status: NotificationStatus.PENDING,
                    },
                  },
          },
        }),
      ),
    );

    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: "NOTIFICATION_CREATED",
        entityType: "Notification",
        meta: {
          recipients: dto.recipientUserIds.length,
          channel: dto.channel ?? NotificationChannel.IN_APP,
          entityType: dto.entityType,
          entityId: dto.entityId,
        } as Prisma.InputJsonValue,
      },
    });

    return created;
  }

  async sendPracticeDemonstration(
    dto: SendPracticeDemonstrationDto,
    user: JwtPayload,
  ) {
    if (!["ADMIN", "TEACHER"].some((role) => user.roles.includes(role))) {
      throw new ForbiddenException(
        "Only admin or teacher can send practice demonstrations",
      );
    }

    const practice = await this.prisma.practice.findUnique({
      where: { id: dto.practiceId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!practice) {
      throw new NotFoundException("Practice not found");
    }

    const recipients = await this.prisma.userInstitution.findMany({
      where: {
        institutionId: user.institutionId,
        userId: {
          in: dto.recipientUserIds,
        },
      },
      include: {
        user: true,
      },
    });

    if (recipients.length !== dto.recipientUserIds.length) {
      throw new BadRequestException(
        "All recipients must belong to the active institution",
      );
    }

    const title =
      dto.subject ??
      `Practica de demostracion: ${practice.titleEs} - ${practice.lesson.module.course.titleEs}`;
    const body =
      dto.message ??
      [
        `Curso: ${practice.lesson.module.course.titleEs}`,
        `Modulo: ${practice.lesson.module.titleEs}`,
        `Practica: ${practice.titleEs}`,
        "",
        "Se ha compartido una practica de demostracion desde el LMS.",
      ].join("\n");

    const notifications = await this.prisma.$transaction(
      recipients.map((recipient) =>
        this.prisma.notification.create({
          data: {
            institutionId: user.institutionId,
            userId: recipient.userId,
            channel: NotificationChannel.BOTH,
            status: NotificationStatus.PENDING,
            title,
            body,
            entityType: "Practice",
            entityId: practice.id,
            emailDeliveries: {
              create: {
                recipientEmail: recipient.user.email,
                subject: title,
                body,
                status: NotificationStatus.PENDING,
              },
            },
          },
          include: notificationInclude,
        }),
      ),
    );

    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: "PRACTICE_DEMONSTRATION_SENT",
        entityType: "Practice",
        entityId: practice.id,
        meta: JSON.parse(
          JSON.stringify({
            recipientCount: dto.recipientUserIds.length,
            courseId: practice.lesson.module.course.id,
            moduleId: practice.lesson.module.id,
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    return notifications;
  }
}
