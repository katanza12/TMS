import { Component, type OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Card } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';

import { AuthService } from '../../services/auth.service';
import { SessioneService } from '../../services/sessione.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    Card,
    ButtonModule,
    FloatLabel,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  private authService = inject(AuthService);
  private sessioneService = inject(SessioneService);
  private router = inject(Router);

  username?: string;
  password?: string;

  ngOnInit(): void {
    this.authService.registerLoginSubject().subscribe({
      next: (user) => {
        console.log("Login riuscito", user);
        this.sessioneService.setUserLogged(user);
        this.router.navigate(["/home"]);
      },
      error: (error) => {
        console.log("Login error:", error);
        this.sessioneService.sendErrorMessage("Credenziali errate");
      }
    });
  }

  doLogin() {
    if (!this.username || !this.password) {
      this.sessioneService.sendErrorMessage("Inserire username e password");
      return;
    }
    this.sessioneService.setUserLogged(undefined);
    this.authService.login(this.username, this.password);
  }

}
