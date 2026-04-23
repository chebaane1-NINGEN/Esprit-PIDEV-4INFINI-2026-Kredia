import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../../core/http/api.config';

export interface ReclamationMessage {
  messageId?: number;
  authorUserId?: number;
  message: string;
  createdAt?: string;
  visibility?: 'PUBLIC' | 'INTERNAL';
}

@Injectable({ providedIn: 'root' })
export class ReclamationMessageApi {
  constructor(private readonly http: HttpClient) {}

  findByReclamation(reclamationId: number, includeInternal = false): Observable<ReclamationMessage[]> {
    const params = new HttpParams().set('includeInternal', includeInternal.toString());
    return this.http.get<ReclamationMessage[]>(`${API_BASE_URL}/api/reclamations/${reclamationId}/messages`, { params });
  }

  send(reclamationId: number, message: string, internal = false): Observable<ReclamationMessage> {
    const body = {
      message,
      authorUserId: 0, // Backend should ideally get this from token or actor-id
      visibility: internal ? 'INTERNAL' : 'PUBLIC'
    };
    return this.http.post<ReclamationMessage>(`${API_BASE_URL}/api/reclamations/${reclamationId}/messages`, body);
  }
}
