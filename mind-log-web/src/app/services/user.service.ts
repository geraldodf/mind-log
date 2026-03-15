import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Pageable} from "../models/util/pageable.interface";
import {User} from "../models/user/user.interface";
import {UtilsService} from "./utils/utils.service";
import {UserRegisterDTO} from '../dto/user-register-dto';
import {Role} from '../models/user/role.interface';
import {AuthenticationResponse} from '../models/auth/authentication-response.interface';
import {UserSearchResult} from '../models/user/user-search-result.interface';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);
  private readonly utils = inject(UtilsService);
  private readonly RESOURCE_PATH: string = environment.apiPath + '/v1/users';

  getAll(pageSize: number, pageNumber: number, sort: string) {
    const params: HttpParams = this.utils.getFilterAndPageParams(null, pageSize, pageNumber - 1, sort);
    return this.http.get<Pageable<User>>(this.RESOURCE_PATH, { params: params });
  }

  getMe() {
    return this.http.get<User>(`${this.RESOURCE_PATH}/me`);
  }

  checkAvailabilityEmail(email: string) {
    let params = new HttpParams();
    params = params.append('term', email);
    return this.http.get<boolean>(`${this.RESOURCE_PATH}/availability-email`, {params});
  }

  checkAvailabilityUsername(username: string) {
    let params = new HttpParams();
    params = params.append('term', username);
    return this.http.get<boolean>(`${this.RESOURCE_PATH}/availability-username`, {params});
  }

  createUser(user: UserRegisterDTO){
    return this.http.post<UserRegisterDTO>(this.RESOURCE_PATH +'/sign-up', user);
  }
  getRoles(){
    return this.http.get<Role[]>(this.RESOURCE_PATH + '/form-resources');
  }

  updateEnabledStatus(userId: number, enabled: boolean) {
    return this.http.patch(`${this.RESOURCE_PATH}/${userId}/enabled`, enabled);
  }

  profileUpdate(id: number, data: User) {
    return this.http.put<AuthenticationResponse>(`${this.RESOURCE_PATH}/profile/${id}`, data);
  }

  deleteMe() {
    return this.http.delete<void>(`${this.RESOURCE_PATH}/me`);
  }

  searchUsers(q: string, page = 0, size = 20) {
    // Strip a leading '@' — usernames are stored without it
    const sanitized = q.startsWith('@') ? q.slice(1) : q;
    const params = new HttpParams()
      .set('q', sanitized)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Pageable<UserSearchResult>>(`${this.RESOURCE_PATH}/search`, { params });
  }

}
