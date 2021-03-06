import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as io from 'socket.io-client';
import {AppSettingsService} from "./app-settings.service";

@Injectable()
export class WebsocketService {

  private queuedCommands = [];

  keepaliveTimeout = 60 * 1000;
  reconnectTimeout = 5 * 1000;

  keepaliveSet = false;

  private connected = false;
  private socket;

  subscribedAccounts = [];

  newTransactions$ = new BehaviorSubject(null);

  constructor(private appSettings: AppSettingsService) { }

  forceReconnect() {
    if (this.socket.connected && this.socket.ws) {
      // Override the onclose event so it doesnt try to reconnect the old instance
      this.socket.ws.onclose = event => {
      };
      this.socket.ws.close();
      delete this.socket.ws;
      this.socket.connected = false;
    }

    setTimeout(() => this.connect(), 250);
  }

  connect() {
    if (this.connected && this.socket) return;
    delete this.socket; // Maybe this will erase old connections

    this.appSettings.loadAppSettings();

    const ws = io('wss://' + this.appSettings.getAppSetting('backend'));
    this.socket = ws;

    ws.on('connect', () => {
      console.log('Socket connected!');

      this.connected = true;
      this.queuedCommands.forEach(account => ws.emit('subscribe', account));

      // Resubscribe to accounts?
      if (this.subscribedAccounts.length) {
        this.subscribeAccounts(this.subscribedAccounts);
      }

      if (!this.keepaliveSet) {
        this.keepalive(); // Start keepalives!
      }
    });

    ws.on('disconnect', () => {
      this.connected = false;

      console.log(`Socket disconnected`);

      // Start attempting to recconect
      setTimeout(() => this.reconnect(), this.reconnectTimeout);
    });

    ws.on('error', (error) => {
      console.error(error);
    });

    ws.on('newTransaction', (block) => {
      try {
          this.newTransactions$.next(block);
      } catch (err) {
        console.log(`Error parsing message`, err);
      }
    });

  }

  disconnect() {
    if (this.connected) {
      this.connected = false;
      this.socket.disconnect();
      delete this.socket; // Maybe this will erase old connections
    }
  }

  reconnect() {
    if (this.connected) {
      this.disconnect();
    }
    this.connect();
    if (this.reconnectTimeout < 30 * 1000) {
      this.reconnectTimeout += 5 * 1000; // Slowly increase the timeout up to 30 seconds
    }
  }

  keepalive() {
    return; // I don't think we need this
    /*
    this.keepaliveSet = true;
    if (this.socket.connected) {
      this.socket.send(JSON.stringify({ event: 'keepalive' }));
    }

    setTimeout(() => {
      this.keepalive();
    }, this.keepaliveTimeout);
    */
  }

  subscribeAccounts(accountIDs: string[]) {
    accountIDs.forEach(account => {
      if (this.subscribedAccounts.indexOf(account) === -1) {
        this.subscribedAccounts.push(account); // Keep a unique list of subscriptions for reconnecting
        if (this.connected) {
          this.socket.emit('subscribe', account);
        } else {
          this.queuedCommands.push(account);
          if (this.queuedCommands.length >= 3) {
            this.queuedCommands.shift(); // Prune queued commands
          }
        }
      }
    });
  }

  unsubscribeAccounts(accountIDs: string[]) {
    accountIDs.forEach(account => {
      const existingIndex = this.subscribedAccounts.indexOf(account);
      if (existingIndex !== -1) {
        this.subscribedAccounts.splice(existingIndex, 1); // Remove from our internal subscription list
        if (this.connected) {
          this.socket.emit('unsubscribe', account);
        }
      }
    });
    // If we aren't connected, we don't need to do anything.  On reconnect, it won't subscribe.
  }

}
