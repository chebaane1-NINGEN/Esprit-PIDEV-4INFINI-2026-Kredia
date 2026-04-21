import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../../core/http/api.config';
import { User, UserStatus } from '../models/user.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class UserApi {
  constructor(private readonly http: HttpClient) {}

  findAll(query?: string, role?: string, status?: UserStatus, page = 0, size = 20): Observable<{ users: User[]; totalElements: number }> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (query) {
      params = params.set('email', query);
    }
    if (role) {
      params = params.set('role', role);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<PageResponse<User>>>(`${API_BASE_URL}/api/user`, { params }).pipe(
      map(response => ({
        users: response.data?.content ?? [],
        totalElements: response.data?.totalElements ?? 0
      }))
    );
  }

  findById(id: number): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${API_BASE_URL}/api/user/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateStatus(id: number, status: UserStatus): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${API_BASE_URL}/api/user/${id}/status`, { status }).pipe(
      map(response => response.data)
    );
  }
}
