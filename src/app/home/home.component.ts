import { Component, OnInit, ViewChild } from '@angular/core';
import xml2js from 'xml2js'
import { ApiService } from '../services/api.service'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { FirebaseStorageService } from './../firebase-storage.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ELEMENT_DATA:any
  displayedColumns: string[] = ['nombre', 'fechaCaptura' , 'fechaInicial' , 'fechaFinal' , 'urlDescarga'];
  dataSource: MatTableDataSource<PeriodicElement>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  title = 'historyXML';
  urlXML:string
  nombreXML="No se seleccionado ningun archivo"
  nombreNuevoXML=""
  archivo:any
  subidaFinalizada=false
  subiendoArchivo=false
  archivoseleccionado=false
  public xmlItems:any;
  public porcentaje = 0;
  dataCapturas: PeriodicElement[]=[];
  constructor(private firebaseStorage: FirebaseStorageService,private http:HttpClient, private api: ApiService){
    this.verCapturas()
    this.cargarXML()
  }


  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }

  verCapturas(){
    this.api.verCapturas().subscribe((response) => {
      console.log(response)
      this.dataSource = new MatTableDataSource(response);
     })
  }

  eliminarCaptura(id){
    console.log(id)
    this.api.eliminarCaptura(id).subscribe((response) => {
      console.log(response)
      this.verCapturas()
      this.ngOnInit()
     })
  }

  subirXML(e){
    this.urlXML = e.target.value;
    this.nombreXML="No se seleccionado ningun archivo"
    this.archivoseleccionado=false
    if(e.target.files[0]){
      this.nombreXML = e.target.files[0].name
      this.archivo = e.target.files[0]
      console.log(e.target.files[0])
      
      this.api.subirArchivo(this.archivo).subscribe((response) => {
        console.log(response)
       })
       
      /*let fecha= new Date()
      let year =fecha.getFullYear()
      let month = fecha.getMonth()+1
      let day = fecha.getDate()
      if(day<10){
        this.nombreNuevoXML=this.nombreXML.split(".")[0]+"0"+day+month+year+".xml"
      }
      this.nombreNuevoXML=this.nombreXML.split(".")[0]+day+month+year+".xml"
      this.archivoseleccionado=true*/
    }
  }

  guardarXML(){
    this.subiendoArchivo=true
    console.log("Tratando de subir...")
    let referencia = this.firebaseStorage.referenciaCloudStorage(this.nombreNuevoXML);
    let tarea = this.firebaseStorage.tareaCloudStorage(this.nombreNuevoXML, this.archivo);
    
    tarea.percentageChanges().subscribe((porcentaje) => {
      this.porcentaje = Math.round(porcentaje);
      if (this.porcentaje == 100) {
        this.subidaFinalizada = true;
        this.cargarXML()
      }
    });
    
    referencia.getDownloadURL().subscribe((URL) => {
      console.log("URL: "+URL)
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function(event) {
        var blob = xhr.response;
      };
      xhr.open('GET', URL);
      xhr.send();
      this.urlPrueba
    });
  }
  
  urlPrueba=""
  
  downloadXML(url) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function(event) {
      var blob = xhr.response;
    };
    xhr.open('GET', url);
    xhr.send();
  }

  //Lector de XML
  cargarXML(){
    this.http.get(this.urlXML,
    {
      headers: new HttpHeaders().set('Content-Type','text/xml')
      .append('Access-Control-Allow-Methods','GET')
      .append('Access-Control-Allow-Origin','*')
      .append('Access-Control-Allow-Headers',"Access-Control-Allow-Headers,Access-Control-Allow-Origin,Access-Control-Allow-Methods"),
      responseType: 'text'
    }).subscribe((data) => {
      this.parseXML(data).then((data) => {
        this.xmlItems = data
      })
    })
  }

  parseXML(data){
    return new Promise(resolve => {
      var k: string | number, 
      arr = [],
      parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      })
      parser.parseString(data, function( err, result){
        var obj = result.Employee;
        for (k in obj.emp){
          var item = obj.emp[k]
          arr.push({
            id: item.id[0],
            name: item.name[0],
            gender: item.gender[0],
            mobile: item.mobile[0]
          })
        }
        resolve(arr)
      })
    })
  }
}

  export interface PeriodicElement {
    nombre: string;
    fechaCaptura: string;
    fechaInicial: string;
    fechaFinal: string;
    urlDescarga:string;
  }