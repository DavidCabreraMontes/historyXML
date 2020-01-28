import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service'
import { HttpClient, HttpHeaders } from '@angular/common/http'
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

  mensajeError="Error!! Revise los campos de su archivo."
  nombreXML="No se seleccionado ningun archivo"
  nombreNuevoXML=""
  archivo:any
  dataCapturas: PeriodicElement[]=[];
  listCapturas:any

  //Banderas de alertas
  subidaFinalizada=false
  subiendoArchivo=false
  archivoseleccionado=false
  subidaError=false
  subiendo=false
  
  constructor(private http:HttpClient, private api: ApiService){
    
  }

  ngOnInit() {
    this.verCapturas()
    this.dataSource.paginator = this.paginator;
  }

  verCapturas(){
    this.api.verCapturas().subscribe((response) => {
      this.listCapturas=response
      this.dataSource = new MatTableDataSource(response);
    })
  }

  eliminarCaptura(id){
    this.api.eliminarCaptura(id).subscribe((response) => {
      this.ngOnInit()
    }, error =>{
      this.ngOnInit()
    })
  }

  subirXML(e){
    this.subidaFinalizada=false
    this.subidaError=false
    this.subiendo=false
    this.nombreXML="No se seleccionado ningun archivo"
    this.archivoseleccionado=false

    if(e.target.files[0]){
      this.nombreXML = e.target.files[0].name
      this.archivo = e.target.files[0]
      this.archivoseleccionado=true
    }
  }

  guardarXML(){
    this.subiendo=true
    this.subidaFinalizada=false
    this.subiendoArchivo=true
    let fechaCaptura
    let dayString
    let monthtring
    this.subidaError=false
    let fecha= new Date()
    let year =fecha.getFullYear()
    let month = fecha.getMonth()+1
    let day = fecha.getDate()
    dayString=""+day
    monthtring=""+month
    if(day<10){
      dayString="0"+day
    }
    if(month<10){
      monthtring="0"+month
    }
    fechaCaptura = year+"-"+monthtring+"-"+dayString
    this.nombreNuevoXML=this.nombreXML.split(".")[0]+fechaCaptura+".xml"

    const arrayCapturas = this.dataSource.data //Se usa como variable temporal
    let resul= arrayCapturas.find(captura => captura.nombre==this.nombreNuevoXML)
    
    if(resul != undefined){
      this.subidaError=true
      this.subidaFinalizada=false
      this.subiendo=false
      this.mensajeError="Error!! Cambie el nombre del archivo."
      return 0
    }

    this.api.subirArchivo(this.archivo,this.nombreNuevoXML,fechaCaptura).subscribe((response) => {
      if(response!=null){
        this.subidaFinalizada = true
        this.ngOnInit()
      }else{
        this.subidaError=true
      }
    },err => {
      console.log("Error: ",err)
      this.subidaError=true
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