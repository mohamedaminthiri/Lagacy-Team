import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { User } from '../models/user.model';
import { JwtHelperService } from '@auth0/angular-jwt';
const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly rootUrl = 'http://localhost:3001/api';

  authToken: any;
  user: any;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  constructor(private http: HttpClient) {}

  userAuthentification(email: any, password: any) {
    var data = {
      email: email,
      password: password,
    };
    var requestHeader = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post(this.rootUrl + '/user/login', data, this.httpOptions);
  }

  registerUser(user: User) {
    const body: User = {
      username: user.username,
      email: user.email,
      password: user.password,
      kickers: user.kickers,
      kicked: user.kicked,
      bio: user.bio,
      stars: user.stars,
    };
    return this.http.post(
      this.rootUrl + '/user/register',
      body,
      this.httpOptions
    );
  }

  getAllUsers() {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get(this.rootUrl, { headers: headers });
  }

  getProfile() {
    this.loadToken();
    let headers = new HttpHeaders({
      Authorization: this.authToken,
      'Content-Type': 'application/json',
    });
    return this.http.get(this.rootUrl + '/profile', { headers: headers });
  }

  storeUserData(token: string, user: any) {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  Logout() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn() {
    let token = localStorage.getItem('id_token') || undefined;
    return !helper.isTokenExpired(token);
  }
}
