import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';

import { SessioneService } from './services/sessione.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
      RouterOutlet,
      ToastModule,
    ],
    providers: [
      MessageService,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'TMS';

  private sessioneService = inject(SessioneService);
  private messageService = inject(MessageService);

  constructor(private primeNG: PrimeNG) {}

  ngOnInit(): void {
    this.primeNG.ripple.set(true);

    this.sessioneService.registerMessage().subscribe({
      next: (msg) => {
        this.messageService.add(msg);
      }
    });
  }
}
