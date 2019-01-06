import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "./notification.service";
import { UtilService } from "./util.service";

@Injectable()
export class MyNanoNinjaService {

  // URL to Ninja API
  ninjaUrl = 'https://mynano.ninja/api/';

  // null - loading, false - offline, true - online
  status = null;

  constructor(private http: HttpClient, private notifications: NotificationService, private util: UtilService) { }

  private async request(action): Promise<any> {
    return await this.http.get(this.ninjaUrl + action).toPromise()
      .then(res => {
        this.setOnline();
        return res;
      })
      .catch(err => {
        console.error(err);

        if (err.status === 500 || err.status === 502 || err.status === 0) {
          this.setOffline(); // Hard error, node is offline
        }
        return;
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

  randomizeByScore(replist: any) {

    let scores = {};
    let newlist = [];

    for (const account of replist) {
      scores[account.score] = scores[account.score] || [];
      scores[account.score].push(account);
    }

    for (const score in scores) {
      if (scores.hasOwnProperty(score)) {
        let accounts = scores[score];
        accounts = this.util.array.shuffle(accounts);

        for (const account of accounts) {
          newlist.unshift(account);
        }
      }
    }

    return newlist;
  }

  async verified(): Promise<any> {
    return await this.request('accounts/verified');
  }

  async verifiedRandomized(): Promise<any> {
    const replist = await this.verified();
    return this.randomizeByScore(replist);
  }

  async getRandomRep(): Promise<any> {
    const replist = await this.verifiedRandomized();
    return replist[0].account;
  }

  async getAccount(account: string): Promise<any> {
    return await this.request('accounts/' + account);
  }

}
