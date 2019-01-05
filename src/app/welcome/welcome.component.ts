import { Component, OnInit } from '@angular/core';
import {WalletService} from "../services/wallet.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  donationAccount = `xrb_1ninja7rh37ehfp9utkor5ixmxyg8kme8fnzc4zty145ibch8kf5jwpnzr3r`;

  wallet = this.walletService.wallet;

  constructor(private walletService: WalletService) { }

  ngOnInit() {
  }

}
