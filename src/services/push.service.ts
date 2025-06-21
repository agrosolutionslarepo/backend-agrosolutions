import { Types } from 'mongoose';
import fetch from 'node-fetch';
import Usuario from '../models/usuario';

const EXPO_URL = 'https://exp.host/--/api/v2/push/send';

export async function pushToUser(userId: Types.ObjectId, message: string) {
  try {
    const usuario = await Usuario.findById(userId).select('expoToken');
    const token = usuario?.expoToken;
    if (!token) {
      console.log(`[PUSH] no expo token for user ${userId}`);
      return;
    }

    const body = [{ to: token, sound: 'default', body: message }];
    const res = await fetch(EXPO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error(`[PUSH] Expo error ${res.status}: ${detail}`);
    }
  } catch (err) {
    console.error('[PUSH] error', err);
  }
}