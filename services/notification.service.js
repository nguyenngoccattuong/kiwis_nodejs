const admin = require('firebase-admin');
const logger = require('../middleware/logger.middleware');
const UserModel = require("../models/user.model");
class NotificationService {
  constructor() {
    this.userModel = new UserModel();
    this.messaging = admin.messaging();
  }

  async sendNotificationByFCMToken(fcmToken, notification) {
    return await this.messaging.send({
      token: fcmToken,
      notification: notification,
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      },
    });
  }

  // Gửi thông báo cho một user cụ thể
  async sendToUser(userId, notification) {
    try {
      //Lấy token từ database dựa vào userId
      const userToken = await this.getUserFCMToken(userId);
      
      if (userToken) {
        const message = {
          token: userToken,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data || {},
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'default'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1
              }
            }
          }
        };
  
        const response = await this.messaging.send(message);
        console.log(`Notification sent to user ${userId}: ${response}`);
        return response;
      }

      return null;
    } catch (error) {
      console.error(`Error sending notification to user ${userId}: ${error.message}`);
      throw error;
    }
  }

  // Gửi thông báo cho nhiều user
  async sendToUsers(userIds, notification) {
    try {
      // Lấy danh sách token từ database
      const tokens = await Promise.all(
        userIds.map(userId => this.getUserFCMToken(userId))
      );
      
      const validTokens = tokens.filter(token => token);

      if (validTokens.length === 0) {
        console.log('No valid FCM tokens found');
        return null;
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        tokens: validTokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.sendMulticast(message);
      // logger.info(`Batch notification sent: ${response.successCount} successful, ${response.failureCount} failed`);
      return response;
    } catch (error) {
      // logger.error(`Error sending batch notification: ${error.message}`);
      console.log(`Error sending batch notification: ${error.message}`);
      throw error;
    }
  }

  // Gửi thông báo cho tất cả users (topic)
  async sendToTopic(topic, notification) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      logger.info(`Topic notification sent: ${response}`);
      return response;
    } catch (error) {
      logger.error(`Error sending topic notification: ${error.message}`);
      throw error;
    }
  }

  // Lên lịch gửi thông báo
  async scheduleNotification(notification, scheduledTime) {
    try {
      // Tính thời gian delay (ms)
      const delay = scheduledTime.getTime() - Date.now();
      
      if (delay <= 0) {
        throw new Error('Scheduled time must be in the future');
      }

      // Sử dụng setTimeout để lên lịch
      setTimeout(async () => {
        if (notification.userId) {
          await this.sendToUser(notification.userId, notification);
        } else if (notification.userIds) {
          await this.sendToUsers(notification.userIds, notification);
        } else if (notification.topic) {
          await this.sendToTopic(notification.topic, notification);
        }
      }, delay);

      logger.info(`Notification scheduled for ${scheduledTime}`);
      return true;
    } catch (error) {
      logger.error(`Error scheduling notification: ${error.message}`);
      throw error;
    }
  }

  // Helper function để lấy FCM token từ database
  async getUserFCMToken(userId) {
    return await this.userModel.getUserFCMToken(userId);
  }
}

module.exports = new NotificationService();
