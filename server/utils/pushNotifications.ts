import { Expo } from 'expo-server-sdk';

let expo = new Expo();

export const sendPushNotification = async (targetToken: string, title: string, body: string, data = {}) => {
  if (!Expo.isExpoPushToken(targetToken)) {
    console.error(`Token ${targetToken} inválido`);
    return;
  }

  const messages = [{
    to: targetToken,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
  }];

  try {
    await expo.sendPushNotificationsAsync(messages);
  } catch (error) {
    console.error(error);
  }
};