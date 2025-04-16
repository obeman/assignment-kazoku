import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '../types/order.types';

interface SMTPError extends Error {
  code?: string;
  command?: string;
}

interface OrderCreatedEvent {
  orderId: string;
  status: OrderStatus;
  customerEmail: string;
  totalPrice: number;
}

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly configService: ConfigService) {
    const emailUser = this.configService.get('EMAIL_USER');
    const emailPassword = this.configService.get('EMAIL_PASSWORD');

    this.logger.log(`Initializing email service with user: ${emailUser}`);

    if (!emailUser || !emailPassword) {
      this.logger.warn('Email credentials not configured. Email notifications will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    // Verify transporter configuration
    this.transporter.verify((error) => {
      if (error) {
        const smtpError = error as SMTPError;
        this.logger.error('Email transporter configuration error:', error);
        this.logger.error('Error details:', {
          code: smtpError.code,
          command: smtpError.command,
          message: smtpError.message
        });
      } else {
        this.logger.log('Email transporter configured successfully');
      }
    });
  }

  async sendOrderConfirmation(data: OrderCreatedEvent) {
    if (!this.transporter) {
      this.logger.warn('Email service not configured, skipping order confirmation');
      return;
    }

    this.logger.log(`Attempting to send email to: ${data.customerEmail}`);

    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: data.customerEmail,
      subject: 'Order Confirmation',
      html: `
        <h1>Order Confirmation</h1>
        <p>Your order has been received!</p>
        <p>Order ID: ${data.orderId}</p>
        <p>Status: ${data.status}</p>
        <p>Total Price: $${data.totalPrice}</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Order confirmation email sent successfully to ${data.customerEmail}`);
      this.logger.debug('Email details:', {
        messageId: info.messageId,
        response: info.response
      });
    } catch (error) {
      const smtpError = error as SMTPError;
      this.logger.error('Error sending order confirmation email:', error);
      this.logger.error('Error details:', {
        code: smtpError.code,
        command: smtpError.command,
        message: smtpError.message
      });
    }
  }
} 