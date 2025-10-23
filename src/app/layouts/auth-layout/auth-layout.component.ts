import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-auth-layout',
    standalone: true,
    imports: [RouterOutlet],
    template: `
    <div >
      <router-outlet></router-outlet>
    </div>
  `
})
export class AuthLayoutComponent    { }
