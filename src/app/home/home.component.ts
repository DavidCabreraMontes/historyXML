import { Component, OnInit } from '@angular/core';
import xml2js from 'xml2js'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { FirebaseStorageService } from './../firebase-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  title = 'historyXML';
  urlXML:string
  nombreXML="No se seleccionado ningun archivo"
  nombreNuevoXML=""
  archivo:any
  subidaFinalizada=false
  archivoseleccionado=false
  public xmlItems:any;
  public porcentaje = 0;
  constructor(private firebaseStorage: FirebaseStorageService,private http:HttpClient){ 
    this.loadXML();
  }


  ngOnInit() {
  }
  subirXML(e){
    this.urlXML = e.target.value;
    this.nombreXML="No se seleccionado ningun archivo"
    this.archivoseleccionado=false
    if(e.target.files[0]){
      this.nombreXML = e.target.files[0].name
      this.archivo = e.target.files[0]
      console.log(e.target.files[0])
  
      let fecha= new Date()
      let year =fecha.getFullYear()
      let month = fecha.getMonth()+1
      let day = fecha.getDate()
      if(day<10){
        this.nombreNuevoXML=this.nombreXML.split(".")[0]+"0"+day+month+year+".xml"
      }
      this.nombreNuevoXML=this.nombreXML.split(".")[0]+day+month+year+".xml"
      this.archivoseleccionado=true
    }
  }

  guardarXML(){
    console.log("Tratando de subir...")
    let referencia = this.firebaseStorage.referenciaCloudStorage(this.nombreNuevoXML);
    let tarea = this.firebaseStorage.tareaCloudStorage(this.nombreNuevoXML, this.archivo);
    
    //Cambia el porcentaje
    tarea.percentageChanges().subscribe((porcentaje) => {
      this.porcentaje = Math.round(porcentaje);
      if (this.porcentaje == 100) {
        this.subidaFinalizada = true;
        console.log("Finalizado.")
      }
    });
    
    referencia.getDownloadURL().subscribe((URL) => {
      console.log("URL: "+URL)
    });
  }

  //Lector de XML
  loadXML(){
    this.http.get('/assets/users.xml',
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
