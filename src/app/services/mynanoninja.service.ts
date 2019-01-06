import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {NotificationService} from "./notification.service";

@Injectable()
export class MyNanoNinjaService {

  // URL to Ninja API
  ninjaUrl = 'https://mynano.ninja/api/';

  // null - loading, false - offline, true - online
  status = null;

  constructor(private http: HttpClient, private notifications: NotificationService) { }

  private async request(action): Promise<any> {
    return await this.http.get(this.ninjaUrl + action).toPromise()
      .then(res => {
        this.setOnline();
        return res;
      })
      .catch(err => {
        if (err.status === 500 || err.status === 0) {
          this.setOffline(); // Hard error, node is offline
        }
        throw err;
      });
  }

  setOffline() {
    if (this.status === false) return; // Already offline
    this.status = false;

    this.notifications.sendError(`Unable to connect to My Nano Ninja!`, { identifier: 'ninja-offline', length: 0 });
  }

  setOnline() {
    if (this.status) return; // Already online

    this.status = true;
    this.notifications.removeNotification('ninja-offline');
  }

  async verified(): Promise<any> {
    return await this.request('accounts/verified');
  }

  async getAccount(account: string): Promise<any> {
    return await this.request('accounts/' + account);
  }

}
