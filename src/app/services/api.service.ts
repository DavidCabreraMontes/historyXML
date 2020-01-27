import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url="http://localhost:8080/api/v1/";

    constructor(private http: HttpClient) { }
  
  agregarCaptura(params){
    return this.http.post(this.url + 'archivos',params);
  }
  
  verCapturas():any{
    let datos = this.http.get(this.url + 'archivos');
    return datos
  }

  eliminarCaptura(id){
    return this.http.delete(this.url + 'archivos/'+id);
  }

  subirArchivo(archivo){
    var params = new FormData();
    params.append('file', archivo);
    return this.http.post(this.url+'archivos/subir',params)
  }
}
